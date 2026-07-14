import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import redis from '../services/redis';
import { validate } from '../middleware/validate';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'refresh-secret';

// Schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    domain: z.enum(['cse', 'ece'], {
      errorMap: () => ({ message: "Domain must be either 'cse' or 'ece'" }),
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});

// Helper: Issue Tokens
async function issueTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Store refresh token in Redis (7 days expiration)
  await redis.set(`refresh:${userId}`, refreshToken, 'EX', 604800);

  return { accessToken, refreshToken };
}

// Routes
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, domain } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        domain,
        tier: 'Explorer',
        xp: 0,
      },
    });

    const { accessToken, refreshToken } = await issueTokens(user.id);

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, domain: user.domain, tier: user.tier, xp: user.xp },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = await issueTokens(user.id);

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, domain: user.domain, tier: user.tier, xp: user.xp },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', validate(refreshSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify token structure and validity
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const userId = payload.userId;

    // Verify token exists in Redis
    const cachedToken = await redis.get(`refresh:${userId}`);
    if (!cachedToken || cachedToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid or revoked session' });
    }

    // Issue a new access token
    const newAccessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err: any) {
    console.error('Refresh token error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await redis.del(`refresh:${userId}`);
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, domain: true, tier: true, xp: true, walletAddress: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Fetch profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth Redirection
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async (req: any, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect('http://localhost:5173/login?error=GoogleAuthFailed');
      }

      const { accessToken, refreshToken } = await issueTokens(user.id);

      // Redirect to frontend landing page with tokens as query params
      return res.redirect(
        `http://localhost:5173/auth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (err: any) {
      console.error('Google OAuth callback error:', err);
      return res.redirect('http://localhost:5173/login?error=ServerError');
    }
  }
);

export default router;
