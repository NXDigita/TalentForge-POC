import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { getAIAdapter } from '../services/ai/aiAdapterFactory';
import { sendShortlistEmail } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/employers/candidates?minScore=&badge=&language=
 * Dynamic candidate filtering with PG index optimization & profilePrivacy code sample protection
 */
router.get('/candidates', async (req, res) => {
  try {
    const minScore = req.query.minScore ? parseInt(req.query.minScore as string, 10) : 0;
    const badgeFilter = (req.query.badge as string) || 'ALL';
    const languageFilter = (req.query.language as string) || 'ALL';

    // 1. Build DB query conditions
    const whereCondition: any = {
      role: 'STUDENT',
    };

    if (badgeFilter !== 'ALL') {
      whereCondition.badges = {
        some: {
          status: badgeFilter,
        },
      };
    }

    // 2. Fetch candidates from Prisma
    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        badges: true,
        psychProfile: true,
        submissions: {
          orderBy: { score: 'desc' },
          include: { problem: true },
        },
      },
      take: 50,
    });

    // 3. Format candidate metrics & privacy access control
    const candidates = users
      .map((u) => {
        // Filter submissions by language if specified
        let userSubs = u.submissions;
        if (languageFilter !== 'ALL') {
          userSubs = userSubs.filter((s) => (s.language || 'python').toLowerCase() === languageFilter.toLowerCase());
        }

        const bestSub = userSubs[0] || u.submissions[0] || null;
        const totalScore = bestSub?.score ?? (u.xp > 0 ? Math.min(100, Math.round(u.xp / 10)) : 88);

        // Filter out if score < minScore
        if (totalScore < minScore) return null;

        // Privacy Access Control for Code Sample
        const isPublic = u.profilePublic ?? true;
        let bestCodeSample = bestSub?.code || `# Two Sum Solution in Python 3\ndef twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []\n`;

        if (!isPublic) {
          bestCodeSample = `// [PRIVACY PROTECTED]\n// Candidate profile is set to Private.\n// Request direct candidate authorization to view raw solution code.`;
        }

        const candidateName = u.isAnonymized
          ? `Anonymous Pioneer #${u.id.slice(0, 4).toUpperCase()}`
          : u.name;

        return {
          id: u.id,
          name: candidateName,
          email: u.email,
          domain: u.domain?.toUpperCase() || 'CSE',
          tier: u.tier || 'Explorer',
          score: totalScore,
          badges: u.badges,
          profilePublic: isPublic,
          psychProfile: u.psychProfile || {
            logical: 92,
            detail: 88,
            persistence: 95,
            learning: 90,
          },
          bestProblem: bestSub?.problem?.title || 'Two Sum',
          bestLanguage: bestSub?.language || 'python',
          bestCodeSample,
          submittedAt: bestSub?.createdAt || u.createdAt,
        };
      })
      .filter(Boolean);

    return res.json(candidates);
  } catch (err) {
    console.error('[EmployersRoute] Candidates fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/employers/shortlist
 * Returns employer's shortlisted candidate IDs and profiles
 */
router.get('/shortlist', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const employerId = req.user?.userId || req.user?.id || 'sample-employer-id';

    const shortlists = await prisma.shortlist.findMany({
      where: { employerId },
      include: {
        user: {
          include: {
            badges: true,
            psychProfile: true,
            submissions: { orderBy: { score: 'desc' }, include: { problem: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shortlistedCandidates = shortlists.map((s) => {
      const u = s.user;
      const bestSub = u.submissions[0] || null;
      const totalScore = bestSub?.score ?? 90;
      const isPublic = u.profilePublic ?? true;

      return {
        id: u.id,
        shortlistId: s.id,
        name: u.isAnonymized ? `Anonymous #${u.id.slice(0, 4)}` : u.name,
        email: u.email,
        domain: u.domain?.toUpperCase() || 'CSE',
        tier: u.tier || 'Explorer',
        score: totalScore,
        badges: u.badges,
        profilePublic: isPublic,
        psychProfile: u.psychProfile || { logical: 92, detail: 88, persistence: 95, learning: 90 },
        bestProblem: bestSub?.problem?.title || 'Two Sum',
        bestLanguage: bestSub?.language || 'python',
        bestCodeSample: isPublic
          ? bestSub?.code || `# Python Solution\ndef solve(): pass`
          : `// [PRIVACY PROTECTED]`,
        shortlistedAt: s.createdAt,
      };
    });

    return res.json(shortlistedCandidates);
  } catch (err) {
    console.error('[EmployersRoute] Shortlist fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/employers/shortlist
 * Adds candidate to employer shortlist
 */
router.post('/shortlist', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const employerId = req.user?.userId || req.user?.id || 'sample-employer-id';
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'candidateId is required' });
    }

    const item = await prisma.shortlist.upsert({
      where: {
        employerId_candidateId: {
          employerId,
          candidateId,
        },
      },
      update: {},
      create: {
        employerId,
        candidateId,
      },
      include: {
        user: true,
      }
    });

    // Send mock email alert
    const employerName = req.user?.name || 'A Top Tech Employer';
    const candidateName = item.user?.name || 'TalentForge Candidate';
    const candidateEmail = item.user?.email || 'candidate@example.com';
    await sendShortlistEmail(candidateEmail, candidateName, employerName);

    return res.json({ ok: true, shortlist: item });
  } catch (err) {
    console.error('[EmployersRoute] Add shortlist error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/employers/shortlist/:candidateId
 * Removes candidate from employer shortlist
 */
router.delete('/shortlist/:candidateId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const employerId = req.user?.userId || req.user?.id || 'sample-employer-id';
    const { candidateId } = req.params;

    await prisma.shortlist.deleteMany({
      where: {
        employerId,
        candidateId,
      },
    });

    return res.json({ ok: true, message: 'Candidate removed from shortlist' });
  } catch (err) {
    console.error('[EmployersRoute] Delete shortlist error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/employers/smart-match
 * Vector search candidates using pgvector and LLM embeddings
 */
router.post('/smart-match', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { roleText } = req.body;
    if (!roleText) {
      return res.status(400).json({ error: 'roleText is required for smart matching' });
    }

    // 1. Generate embedding for the job description/role text
    const aiAdapter = getAIAdapter();
    const roleEmbedding = await aiAdapter.generateEmbedding(roleText);

    // 2. Format embedding to vector string for Postgres: "[1.2, 3.4, ...]"
    const vectorString = `[${roleEmbedding.join(',')}]`;

    // 3. Raw SQL pgvector query (Cosine Distance <=>)
    // Distance 0 = identical, larger = less similar.
    // We normalize to a % score (e.g., (1 - distance) * 100)
    const matches: any[] = await prisma.$queryRaw`
      SELECT 
        u.id, u.name, u.email, u.domain, u.tier, u.xp,
        u."isAnonymized", u."profilePublic",
        1 - (u."profileEmbedding" <=> ${vectorString}::vector) as similarity
      FROM "User" u
      WHERE u.role = 'STUDENT' AND u."profileEmbedding" IS NOT NULL
      ORDER BY u."profileEmbedding" <=> ${vectorString}::vector ASC
      LIMIT 20
    `;

    // 4. Hydrate candidates with badges & best submissions manually
    // (since $queryRaw doesn't include relations natively)
    const userIds = matches.map((m) => m.id);
    const usersWithRelations = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: {
        badges: true,
        psychProfile: true,
        submissions: { orderBy: { score: 'desc' }, include: { problem: true } },
      },
    });

    // 5. Merge and format the output
    const formattedCandidates = matches.map((m) => {
      const uFull = usersWithRelations.find((u) => u.id === m.id);
      if (!uFull) return null;

      const bestSub = uFull.submissions[0] || null;
      const totalScore = bestSub?.score ?? (m.xp > 0 ? Math.min(100, Math.round(m.xp / 10)) : 88);
      const isPublic = m.profilePublic ?? true;
      
      let bestCodeSample = bestSub?.code || `# Two Sum Solution in Python 3\ndef twoSum(nums, target):\n    pass`;
      if (!isPublic) {
        bestCodeSample = `// [PRIVACY PROTECTED]`;
      }

      // Calculate match percentage (incorporating basic score weight optionally)
      // Just map similarity to 0-100%
      const matchPercent = Math.max(0, Math.min(100, Math.round(m.similarity * 100)));

      return {
        id: m.id,
        name: m.isAnonymized ? \`Anonymous Pioneer #\${m.id.slice(0, 4).toUpperCase()}\` : m.name,
        email: m.email,
        domain: (m.domain || 'CSE').toUpperCase(),
        tier: m.tier || 'Explorer',
        score: totalScore,
        badges: uFull.badges,
        profilePublic: isPublic,
        psychProfile: uFull.psychProfile || { logical: 92, detail: 88, persistence: 95, learning: 90 },
        bestProblem: bestSub?.problem?.title || 'Two Sum',
        bestLanguage: bestSub?.language || 'python',
        bestCodeSample,
        matchPercent, // The AI match score!
        submittedAt: bestSub?.createdAt,
      };
    }).filter(Boolean);

    return res.json(formattedCandidates);
  } catch (err) {
    console.error('[EmployersRoute] Smart match error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
