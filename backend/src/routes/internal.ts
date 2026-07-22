import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? 'tf-internal';

/**
 * Middleware: validate x-internal-secret header.
 * Only the worker process (running on the same machine) sends this header.
 */
function requireInternalSecret(req: any, res: any, next: any) {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/**
 * PATCH /internal/submissions/:id
 * Called by the grading worker to update submission status, score, and feedback
 * after a grading job completes. Not exposed to the public.
 */
router.patch('/submissions/:id', requireInternalSecret, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, score, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status:   status ?? 'completed',
        score:    score  ?? null,
        feedback: feedback ? String(feedback) : null,
      },
    });

    return res.json({ ok: true, submission });
  } catch (err: any) {
    // P2025 = record not found in Prisma
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: 'Submission not found' });
    }
    console.error('[Internal] Submission patch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
