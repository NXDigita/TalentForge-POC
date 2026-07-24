/**
 * index.ts  —  TalentForge Grading Worker
 *
 * Lifecycle per job:
 *   1. Fetch student code from S3/MinIO (Day 7+: real fetch, falling back to placeholder).
 *   2. Fetch all test cases (public + hidden) from the backend internal API.
 *   3. Run the code in a Docker sandbox with each test case piped through stdin.
 *   4. Grade correctness  (Day 7): weighted pass rate across all cases.
 *   5. Grade complexity   (Day 8): curve-fit execution times vs input size.
 *   6. Grade style        (Day 8): parse linter output for violations.
 *   7. Compute composite score: 60% correctness + 30% complexity + 10% style.
 *   8. Patch the Submission row via the internal API.
 *   9. Emit grading:complete over Socket.IO so the frontend updates in real-time.
 */

import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Emitter } from '@socket.io/redis-emitter';
import { runCodeInSandbox }   from './grader/sandbox';
import { gradeCorrectness, TestCase } from './grader/correctness';
import { gradeComplexity }    from './grader/complexity';
import { gradeStyle }         from './grader/style';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradeJobData {
  submissionId: string;
  userId:       string;
  problemId:    string;
  s3Key:        string;
  language:     string;
}

interface ProblemCasesResponse {
  problemId:       string;
  slug:            string;
  title:           string;
  publicTestCases: TestCase[];
  hiddenTestCases: TestCase[];
}

// ─── Redis / Socket.IO emitter ────────────────────────────────────────────────

const redisUrl   = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const emitter    = new Emitter(connection);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emitGradingEvent(
  event:        string,
  submissionId: string,
  payload:      Record<string, unknown>,
) {
  emitter.to(`submission:${submissionId}`).emit(event, { submissionId, ...payload });
}

/**
 * Fetch the student's code string from S3/MinIO.
 * Falls back to a language-appropriate "hello world" stub when the object
 * store is unreachable (useful in local dev without MinIO running).
 */
async function fetchCode(s3Key: string, language: string): Promise<string> {
  const minioUrl = process.env.MINIO_INTERNAL_URL;
  const bucket   = process.env.MINIO_BUCKET ?? 'talentforge';

  if (minioUrl) {
    try {
      const res = await fetch(`${minioUrl}/${bucket}/${s3Key}`);
      if (res.ok) {
        return await res.text();
      }
      console.warn(`[Worker] MinIO fetch failed for ${s3Key}: ${res.status}`);
    } catch (err: any) {
      console.warn(`[Worker] MinIO unreachable, falling back to stub: ${err.message}`);
    }
  }

  // Dev fallback stubs
  if (language === 'python')               return '# stub\nprint("0 1")';
  if (language === 'javascript' || language === 'node') return '// stub\nconsole.log("0 1");';
  if (language === 'java')
    return 'public class Solution { public static void main(String[] a) { System.out.println("0 1"); } }';
  return '';
}

/**
 * Fetch all test cases for a problem from the backend internal API.
 */
async function fetchTestCases(
  backendUrl: string,
  problemId:  string,
  secret:     string,
): Promise<ProblemCasesResponse> {
  const res = await fetch(`${backendUrl}/internal/problems/${problemId}/cases`, {
    headers: { 'x-internal-secret': secret },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch test cases for problem ${problemId}: HTTP ${res.status}`);
  }

  return res.json() as Promise<ProblemCasesResponse>;
}

/**
 * Extract the expected complexity string from problem title / future metadata.
 * For the POC we check known slugs; once the Problem model includes an
 * `expectedComplexity` field this can be removed.
 */
function resolveExpectedComplexity(slug: string): string {
  const table: Record<string, string> = {
    'two-sum':     'O(n)',
    'lru-cache':   'O(1)',
    'rate-limiter':'O(1)',
  };
  return table[slug] ?? 'O(n)';
}

// ─── Core grader ──────────────────────────────────────────────────────────────

async function runGrader(
  job: Job<GradeJobData>,
): Promise<{
  correctness: number;
  complexity:  number;
  style:       number;
  total:       number;
  feedback:    object;
}> {
  const { submissionId, problemId, s3Key, language } = job.data;

  const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:5000';
  const secret     = process.env.INTERNAL_SECRET      ?? 'tf-internal';

  // 1. Mark as running
  emitGradingEvent('grading:running', submissionId, { s3Key, language });

  // 2. Fetch code + test cases in parallel
  const [code, casesResponse] = await Promise.all([
    fetchCode(s3Key, language),
    fetchTestCases(backendUrl, problemId, secret),
  ]);

  const publicCases: TestCase[] = casesResponse.publicTestCases  ?? [];
  const hiddenCases: TestCase[] = casesResponse.hiddenTestCases  ?? [];
  const allCases:    TestCase[] = [...publicCases, ...hiddenCases];
  const hiddenStart              = publicCases.length;

  console.log(
    `[Worker] Grading submission ${submissionId}: ${allCases.length} cases ` +
    `(${publicCases.length} public, ${hiddenCases.length} hidden) — lang: ${language}`,
  );

  if (allCases.length === 0) {
    console.warn(`[Worker] No test cases found for problem ${problemId}; skipping grading.`);
    return { correctness: 0, complexity: 0, style: 0, total: 0, feedback: { warning: 'No test cases found.' } };
  }

  // 3. Run sandbox
  const sandboxResult = await runCodeInSandbox(submissionId, language, code, allCases);

  // ── Handle fatal statuses ───────────────────────────────────────────────
  if (sandboxResult.status === 'timeout') {
    throw new Error('TIMEOUT');
  }
  if (sandboxResult.status === 'oom') {
    throw new Error('OOM');
  }
  if (sandboxResult.status === 'compile_error') {
    throw new Error(`COMPILE_ERROR: ${sandboxResult.stderr ?? ''}`);
  }
  if (sandboxResult.status === 'error') {
    throw new Error(sandboxResult.stderr ?? 'Execution Error');
  }

  // 4. Grade correctness (Day 7)
  const correctnessResult = gradeCorrectness(
    allCases,
    sandboxResult.actualOutputs,
    sandboxResult.elapsedTimes,
    hiddenStart,
  );

  // 5. Grade complexity (Day 8)
  const expectedComplexity = resolveExpectedComplexity(casesResponse.slug);
  const complexityResult   = gradeComplexity(
    expectedComplexity,
    sandboxResult.elapsedTimes,
    sandboxResult.stdinSizes,
  );

  // 6. Grade style (Day 8)
  const styleResult = gradeStyle(sandboxResult.styleRaw, language);

  // 7. Composite score:  60% correctness + 30% complexity + 10% style
  const total = Math.round(
    0.60 * correctnessResult.score +
    0.30 * complexityResult.score  +
    0.10 * styleResult.score,
  );

  console.log(
    `[Worker] Scores — correctness:${correctnessResult.score} ` +
    `complexity:${complexityResult.score} style:${styleResult.score} ` +
    `→ total:${total}`,
  );

  return {
    correctness: correctnessResult.score,
    complexity:  complexityResult.score,
    style:       styleResult.score,
    total,
    feedback: {
      correctness: {
        score:       correctnessResult.score,
        passedCount: correctnessResult.passedCount,
        totalCount:  correctnessResult.totalCount,
        cases:       correctnessResult.cases,
      },
      complexity: {
        score:       complexityResult.score,
        estimated:   complexityResult.estimated,
        expected:    complexityResult.expected,
        confidence:  complexityResult.confidence,
        timeSamples: complexityResult.timeSamples,
      },
      style: {
        score:      styleResult.score,
        violations: styleResult.violations,
      },
    },
  };
}

// ─── BullMQ Worker ────────────────────────────────────────────────────────────

const worker = new Worker<GradeJobData>(
  'grading',
  async (job) => {
    const { submissionId, language } = job.data;
    console.log(`[Worker] Picked up job ${job.id} — submission ${submissionId} (${language})`);

    emitGradingEvent('grading:queued', submissionId, { jobId: job.id });

    const scores = await runGrader(job);

    // Patch Submission row in DB via backend internal API
    const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:5000';
    const secret     = process.env.INTERNAL_SECRET      ?? 'tf-internal';

    const patchRes = await fetch(`${backendUrl}/internal/submissions/${submissionId}`, {
      method:  'PATCH',
      headers: {
        'Content-Type':     'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify({
        status:   'completed',
        score:    scores.total,
        feedback: JSON.stringify(scores.feedback),
      }),
    });

    if (!patchRes.ok) {
      console.warn(`[Worker] Failed to patch submission ${submissionId}:`, await patchRes.text());
    }

    // Emit completion event — frontend listens for this to render the score card
    emitGradingEvent('grading:complete', submissionId, {
      scores: {
        correctness: scores.correctness,
        complexity:  scores.complexity,
        style:       scores.style,
        total:       scores.total,
      },
      feedback: scores.feedback,
      status: 'completed',
    });

    console.log(`[Worker] Job ${job.id} done. Total score: ${scores.total}`);
    return scores;
  },
  {
    connection: connection as any,
    concurrency:     4,
    stalledInterval: 30_000,
    maxStalledCount: 1,
  },
);

// ─── Event listeners ──────────────────────────────────────────────────────────

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
