import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');
const queue = new Queue('submissionQueue', { connection });

new Worker(
  'submissionQueue',
  async (job) => {
    console.log('Processing job', job.id, job.name);
    // TODO: implement sandbox execution
  },
  { connection }
);

console.log('Worker started');
