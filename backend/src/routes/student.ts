import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { getUploadUrl } from '../services/s3';
import { gradingQueue } from '../queues/grading';

const router = Router();
const prisma = new PrismaClient();

// ─── GET /api/students/profile ───────────────────────────────────────────────
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true,
        domain: true, tier: true, xp: true,
        badges: { select: { id: true, title: true, mintedAt: true } },
        psychProfile: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/students/problems?tier=&domain= ────────────────────────────────
// Queries problems list. hiddenTestCases are NEVER exposed to clients.
router.get('/problems', async (req, res) => {
  try {
    const { tier, domain } = req.query;
    const filter: Record<string, string> = {};
    if (tier)   filter.tier   = String(tier);
    if (domain) filter.domain = String(domain);

    const problems = await prisma.problem.findMany({
      where: filter,
      select: {
        id: true, title: true, slug: true,
        description: true, tier: true,
        domain: true, reward: true,
        publicTestCases: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json(problems);
  } catch (err) {
    console.error('Problems list error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/students/problems/:slug ───────────────────────────────────────
// Queries a single problem by slug. hiddenTestCases are NEVER exposed to clients.
router.get('/problems/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: {
        id: true, title: true, slug: true,
        description: true, tier: true,
        domain: true, reward: true,
        publicTestCases: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
    });

    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    return res.json(problem);
  } catch (err) {
    console.error('Problem detail error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/students/problems/:id/presigned ───────────────────────────────
// Returns a presigned S3 PUT URL so the client can upload code directly to MinIO.
const presignedSchema = z.object({
  query: z.object({
    language: z.enum(['python', 'javascript', 'java']),
  }),
});

router.get(
  '/problems/:id/presigned',
  requireAuth,
  validate(presignedSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.userId!;
      const { id }       = req.params;
      const { language } = req.query as { language: string };

      const extMap: Record<string, string> = {
        python: 'py',
        javascript: 'js',
        java: 'java',
      };
      const ext    = extMap[language];
      const s3Key  = `submissions/${userId}/${id}/${Date.now()}.${ext}`;
      const uploadUrl = await getUploadUrl(s3Key, 'text/plain');

      return res.json({ uploadUrl, s3Key });
    } catch (err) {
      console.error('Presigned URL error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ─── POST /api/students/problems/:id/submit ─────────────────────────────────
// Accepts submission metadata, creates a Submission row, and enqueues a grading job.
const submitSchema = z.object({
  body: z.object({
    s3Key:    z.string().min(1, 's3Key is required'),
    language: z.enum(['python', 'javascript', 'java']),
  }),
});

router.post(
  '/problems/:id/submit',
  requireAuth,
  validate(submitSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.userId!;
      const problemId  = req.params.id;
      const { s3Key, language } = req.body;

      // Verify problem exists
      const problem = await prisma.problem.findUnique({ where: { id: problemId } });
      if (!problem) return res.status(404).json({ error: 'Problem not found' });

      // Create the submission row (status starts as "queued")
      const submission = await prisma.submission.create({
        data: {
          userId,
          problemId,
          code:   s3Key,   // stores S3 key; actual code lives in object storage
          status: 'queued',
        },
      });

      // Enqueue grading job
      await gradingQueue.add('grade', {
        submissionId: submission.id,
        userId,
        problemId,
        s3Key,
        language,
      });

      return res.status(202).json({
        submissionId: submission.id,
        status:       'queued',
        message:      'Solution queued for grading. Listen to socket event grading:complete for results.',
      });
    } catch (err) {
      console.error('Submission error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ─── GET /api/students/submissions ──────────────────────────────────────────
// Returns paginated submission history for the authenticated student.
router.get('/submissions', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId!;
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limit  = Math.min(50, Number(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    const [submissions, total] = await prisma.$transaction([
      prisma.submission.findMany({
        where: { userId },
        select: {
          id: true, status: true, score: true,
          createdAt: true, updatedAt: true,
          problem: { select: { id: true, title: true, slug: true, tier: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.submission.count({ where: { userId } }),
    ]);

    return res.json({
      data: submissions,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Submissions list error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/students/submissions/:id ──────────────────────────────────────
// Returns full grading result for a single submission.
router.get('/submissions/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId!;
    const { id } = req.params;

    const submission = await prisma.submission.findFirst({
      where: { id, userId },           // userId guard: students only see their own
      include: {
        problem:  { select: { id: true, title: true, slug: true } },
        reviews:  true,
      },
    });

    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    return res.json(submission);
  } catch (err) {
    console.error('Submission detail error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
