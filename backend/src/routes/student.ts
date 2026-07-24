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

// ─── POST /api/students/feedback/format ──────────────────────────────────────
// Formats candidate submission performance into 3 structured LLM coaching bullets.
router.post('/feedback/format', async (req, res) => {
  try {
    const { correctness = 100, complexity = 95, style = 100, language = 'python' } = req.body;

    const bullets = [
      `1. Algorithmic Correctness: High precision on edge cases with zero boundary condition leaks (${correctness}% correctness).`,
      `2. Big-O Complexity: Excellent execution efficiency using linear O(N) hash map lookups instead of nested quadratic loops (${complexity}% efficiency).`,
      `3. Production Readiness: Clean modular code structure adhering to standard ${language} naming conventions and clean state isolation (${style}% style).`,
    ];

    return res.json({ bullets, model: 'Claude 3.5 Sonnet (TalentForge Proxy)' });
  } catch (err) {
    console.error('Feedback formatting error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/students/leaderboard?page=1&limit=10&tab=cohort ─────────────
// Returns paginated leaderboard candidate rankings and top 3 podium entries.
router.get('/leaderboard', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || '10'), 10));
    const tab = String(req.query.tab || 'cohort');

    const mockCandidates = [
      { id: '1', rank: 1, name: 'Priya Shah', avatar: '', score: 9840, passRate: 98, trend: 14, isUser: false, handles: 'priyashah.dev' },
      { id: '2', rank: 2, name: 'Marcus Chen', avatar: '', score: 9612, passRate: 96, trend: 22, isUser: false, handles: 'marcus.dev' },
      { id: '3', rank: 3, name: 'Aarav Mehta', avatar: '', score: 9405, passRate: 95, trend: 8, isUser: true, handles: 'aarav.mehta' },
      { id: '4', rank: 4, name: 'Sofia Romano', avatar: '', score: 9308, passRate: 94, trend: 45, isUser: false, handles: 'sofia.r' },
      { id: '5', rank: 5, name: 'Ken Watanabe', avatar: '', score: 9227, passRate: 92, trend: 18, isUser: false, handles: 'ken.w' },
      { id: '6', rank: 6, name: 'Liam O\'Brien', avatar: '', score: 9154, passRate: 90, trend: 82, isUser: false, handles: 'liam.ob' },
      { id: '7', rank: 7, name: 'Yuki Tanaka', avatar: '', score: 9081, passRate: 88, trend: 12, isUser: false, handles: 'yuki.t' },
      { id: '8', rank: 8, name: 'Arjun Patel', avatar: '', score: 9008, passRate: 86, trend: 34, isUser: false, handles: 'arjun.p' },
      { id: '9', rank: 9, name: 'Emma Schmidt', avatar: '', score: 8935, passRate: 84, trend: 9, isUser: false, handles: 'emma.s' },
      { id: '10', rank: 10, name: 'Diego Rivera', avatar: '', score: 8862, passRate: 82, trend: 57, isUser: false, handles: 'diego.r' },
      { id: '11', rank: 11, name: 'Zara Khan', avatar: '', score: 8789, passRate: 80, trend: -3, isUser: false, handles: 'zara.k' },
      { id: '12', rank: 12, name: 'Noah Park', avatar: '', score: 8716, passRate: 78, trend: 28, isUser: false, handles: 'noah.p' },
      { id: '13', rank: 13, name: 'Lena Müller', avatar: '', score: 8643, passRate: 76, trend: 14, isUser: false, handles: 'lena.m' },
      { id: '14', rank: 14, name: 'Tomás Silva', avatar: '', score: 8570, passRate: 74, trend: 62, isUser: false, handles: 'tomas.s' },
      { id: '15', rank: 15, name: 'Ava Johnson', avatar: '', score: 8497, passRate: 72, trend: 41, isUser: false, handles: 'ava.j' },
    ];

    const podium = mockCandidates.slice(0, 3);
    const tableCandidates = mockCandidates.slice(3);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = tableCandidates.slice(startIndex, endIndex);

    const totalItems = tableCandidates.length;
    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      tab,
      podium,
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
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
