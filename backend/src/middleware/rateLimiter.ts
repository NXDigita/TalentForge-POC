import { Response, NextFunction } from 'express';
import redis from '../services/redis';
import { AuthenticatedRequest } from './authMiddleware';

export const copilotRateLimiter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const key = `rate_limit:copilot:${userId}`;
    const limit = 30;
    
    const current = await redis.get(key);
    
    if (current && parseInt(current, 10) >= limit) {
      return res.status(429).json({ error: 'Rate limit exceeded: 30 messages per day allowed.' });
    }

    if (!current) {
      await redis.set(key, 1, 'EX', 86400); // 24 hours
    } else {
      await redis.incr(key);
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    // Fail open if Redis is down
    next();
  }
};
