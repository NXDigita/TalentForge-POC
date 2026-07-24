import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCertificatePDF } from '../services/pdfGenerator';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/verify/:id
 * Public endpoint to verify an AI Verified Badge by its unique verifyId or ID.
 * Returns verified badge details, candidate name (respecting anonymized toggle),
 * score, status, and PDF download URL.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findFirst({
      where: {
        OR: [
          { verifyId: id },
          { id: id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            domain: true,
            isAnonymized: true,
          },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({
        ok: false,
        error: 'Verification Failed: Badge or certificate not found in TalentForge registry.',
      });
    }

    const candidateName = badge.user.isAnonymized
      ? `Anonymous Pioneer #${badge.user.id.slice(0, 4).toUpperCase()}`
      : badge.user.name;

    return res.json({
      ok: true,
      verifyId: badge.verifyId,
      title: badge.title,
      problemTitle: badge.problemTitle || 'Algorithmic Engineering Challenge',
      problemSlug: badge.problemSlug || 'problem',
      score: badge.score,
      status: badge.status,
      issuedAt: badge.createdAt,
      pdfUrl: badge.pdfUrl || `/api/verify/${badge.verifyId}/pdf`,
      candidate: {
        id: badge.user.id,
        name: candidateName,
        domain: badge.user.domain,
        isAnonymized: badge.user.isAnonymized,
      },
      ogMeta: {
        title: `${badge.title} - ${candidateName}`,
        description: `Verified ${badge.score}/100 technical mastery on ${badge.problemTitle} via TalentForge AI Platform.`,
        image: `https://app.talentforge.in/assets/badge-verify-og.png`,
      },
    });
  } catch (err) {
    console.error('[VerifyRoute] Verification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/verify/:id/pdf
 * Public endpoint to generate and stream PDF certificate directly for download.
 */
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findFirst({
      where: {
        OR: [
          { verifyId: id },
          { id: id },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, isAnonymized: true },
        },
      },
    });

    if (!badge) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const candidateName = badge.user.isAnonymized
      ? `Anonymous Pioneer #${badge.user.id.slice(0, 4).toUpperCase()}`
      : badge.user.name;

    const pdfBuffer = await generateCertificatePDF({
      verifyId: badge.verifyId,
      candidateName,
      badgeTitle: badge.title,
      problemTitle: badge.problemTitle || 'Engineering Challenge',
      score: badge.score,
      issuedAt: badge.createdAt,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="TalentForge_Certificate_${badge.verifyId.slice(0, 8)}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[VerifyPDFRoute] PDF stream error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
