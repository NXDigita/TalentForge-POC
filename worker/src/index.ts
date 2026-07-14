import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import net from 'net';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

async function canConnectTCP(url: string, timeout = 800) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const port = Number(u.port) || 6379;
    return await new Promise<boolean>((resolve) => {
      const sock = net.connect({ host, port }, () => {
        sock.destroy();
        resolve(true);
      });
      sock.on('error', () => resolve(false));
      setTimeout(() => {
        try {
          sock.destroy();
        } catch { }
        resolve(false);
      }, timeout);
    });
  } catch {
    return false;
  }
}

async function startWorker() {
  const reachable = await canConnectTCP(redisUrl);
  if (reachable) {
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
    const queue = new Queue('submissionQueue', { connection });
    new Worker(
      'submissionQueue',
      async (job) => {
        console.log('Processing job', job.id, job.name, 'data:', job.data);
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Job completed', job.id);
        return { success: true };
      },
      { connection }
    );
    console.log('Worker started (connected to ' + redisUrl + ')');
    return;
  }

  console.warn('Redis not reachable at', redisUrl + ',', 'falling back to in-memory worker.');

  const inMemoryQueue: any[] = [];
  (global as any).__tf_inmemory_queue_add = (jobData: any) => inMemoryQueue.push({ id: Date.now().toString(), data: jobData });
  setInterval(async () => {
    const job = inMemoryQueue.shift();
    if (!job) return;
    console.log('Processing in-memory job', job.id, job.data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('In-memory job completed', job.id);
  }, 1000);
  console.log('In-memory worker started');
}

startWorker();
