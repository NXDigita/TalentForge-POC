import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Explicitly trigger connection
redis.connect().catch((err) => {
  console.error('Failed to establish initial Redis connection:', err.message);
});

export default redis;
