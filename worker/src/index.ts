import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Emitter } from '@socket.io/redis-emitter';
import { runCodeInSandbox } from './grader/sandbox';

// ─── Types ──────────────────────────────────────────────────────────────────
interface GradeJobData {
  submissionId: string;
  userId: string;
  problemId: string;
  s3Key: string;
  language: string;
}

// ─── Redis connection ────────────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

// @socket.io/redis-emitter lets the worker push events back through the
// same Redis adapter that the backend socket.io server listens on.
const emitter = new Emitter(connection);

// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Emit a grading lifecycle event to the room `submission:{submissionId}`.
 * The frontend socket hook joins this room and updates the UI in real-time.
 */
function emitGradingEvent(
  event: string,
  submissionId: string,
  payload: Record<string, unknown>
) {
  emitter.to(`submission:${submissionId}`).emit(event, { submissionId, ...payload });
}

/**
 * Executes the submission code in the secure Docker sandbox.
 */
async function runGrader(job: Job<GradeJobData>) {
  const { submissionId, s3Key, language } = job.data;

  // Mark as RUNNING
  emitGradingEvent('grading:running', submissionId, { s3Key, language });

  // For Day 6, we mock the code retrieval from S3.
  // In Week 2 this will pull the actual code string from MinIO/S3 using the s3Key.
  let code = '';
  if (language === 'python') {
    code = 'print("Hello from Python Sandbox!")';
  } else if (language === 'javascript' || language === 'node') {
    code = 'console.log("Hello from Node Sandbox!");';
  } else if (language === 'java') {
    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hello from Java Sandbox!"); } }';
  }

  const scores = await runCodeInSandbox(submissionId, language, code);
  
  if (scores.status === 'timeout') {
    throw new Error('TIMEOUT');
  } else if (scores.status === 'oom') {
    throw new Error('OOM');
  } else if (scores.status === 'error' || scores.status === 'compile_error') {
    throw new Error(scores.stderr || 'Execution Error');
  }

  return { 
    correctness: scores.correctness, 
    complexity: scores.complexity, 
    style: scores.style, 
    total: scores.total 
  };
}

// ─── Worker ──────────────────────────────────────────────────────────────────
const worker = new Worker<GradeJobData>(
  'grading',
  async (job) => {
    const { submissionId, language } = job.data;
    console.log(`[Worker] Picked up job ${job.id} — submission ${submissionId} (${language})`);

    // Notify frontend: job is being processed
    emitGradingEvent('grading:queued', submissionId, { jobId: job.id });

    const scores = await runGrader(job);

    // Update Submission row in DB via a direct HTTP call to the backend API.
    // This avoids importing Prisma (and its native binaries) into the worker.
    const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:5000';
    const patchRes = await fetch(`${backendUrl}/internal/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET ?? 'tf-internal' },
      body: JSON.stringify({ status: 'completed', score: scores.total, feedback: JSON.stringify(scores) }),
    });

    if (!patchRes.ok) {
      console.warn(`[Worker] Failed to patch submission ${submissionId}:`, await patchRes.text());
    }

    // Emit completion event — frontend listens for this to render the score card
    emitGradingEvent('grading:complete', submissionId, {
      scores,
      status: 'completed',
    });

    console.log(`[Worker] Job ${job.id} done. Scores:`, scores);
    return scores;
  },
  {
    connection,
    concurrency: 4,         // process up to 4 jobs simultaneously
    stalledInterval: 30000, // detect stalled jobs every 30s
    maxStalledCount: 1,     // fail stalled job after 1 stall cycle
  }
);

// ─── Event listeners ─────────────────────────────────────────────────────────
worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  const submissionId = job?.data?.submissionId;
  console.error(`[Worker] ❌ Job ${job?.id} failed:`, err.message);

  if (submissionId) {
    emitGradingEvent('grading:failed', submissionId, { reason: err.message });
  }
});

worker.on('stalled', (jobId) => {
  console.warn(`[Worker] ⚠️  Job ${jobId} stalled`);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err.message);
});

console.log('[Worker] 🚀 Grading worker started (concurrency: 4)');
