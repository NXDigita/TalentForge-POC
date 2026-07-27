import rateLimit from 'express-rate-limit';

/**
 * Public API Rate Limiter
 * Enforces 100 requests per 15-minute window for public endpoints.
 */
export const publicApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
