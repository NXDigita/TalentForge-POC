import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/students/profile
router.get('/profile', (req, res) => {
  return res.json({
    id: 'student-1',
    name: 'Student One',
    domain: 'cse',
    tier: 'Explorer',
    xp: 1200,
    badges: []
  });
});

// GET /api/students/problems?tier=&domain=
// Queries problems list. Omit hiddenTestCases to prevent cheating leaks.
router.get('/problems', async (req, res) => {
  try {
    const { tier, domain } = req.query;
    const filter: any = {};
    
    if (tier) filter.tier = String(tier);
    if (domain) filter.domain = String(domain);

    const problems = await prisma.problem.findMany({
      where: filter,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        tier: true,
        domain: true,
        reward: true,
        publicTestCases: true,
        // Omitted/stripped hiddenTestCases
      },
    });

    return res.json(problems);
  } catch (error) {
    console.error('Failed to query problems:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/problems/:slug
// Queries problem by slug. Omit hiddenTestCases to prevent cheating leaks.
router.get('/problems/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await prisma.problem.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        tier: true,
        domain: true,
        reward: true,
        publicTestCases: true,
        // Omitted/stripped hiddenTestCases
      },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.json(problem);
  } catch (error) {
    console.error('Failed to query problem by slug:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
