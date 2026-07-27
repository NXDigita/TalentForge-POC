import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { streamCopilotChat } from '../services/llmService';
import { copilotRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

router.post('/chat', requireAuth, copilotRateLimiter, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { messages, currentPage, mode = 'mentor' } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const lastSubmissionScore = user.submissions.length > 0 ? user.submissions[0].score : null;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = streamCopilotChat(
      messages,
      {
        profile: { name: user.name, domain: user.domain, tier: user.tier },
        currentPage: currentPage || 'Unknown',
        lastSubmissionScore,
      },
      mode
    );

    let fullResponse = '';

    for await (const chunk of stream) {
      fullResponse += chunk;
      // SSE format: data: <content>\n\n
      // We encode the chunk as JSON string to handle newlines easily on the client
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Persist conversation
    let conversation = await prisma.conversation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const newMessages = [
      ...messages,
      { role: 'assistant', content: fullResponse }
    ];

    if (conversation) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: newMessages
        }
      });
    } else {
      await prisma.conversation.create({
        data: {
          userId,
          messages: newMessages
        }
      });
    }

  } catch (err) {
    console.error('Copilot chat error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.end();
  }
});

export default router;
