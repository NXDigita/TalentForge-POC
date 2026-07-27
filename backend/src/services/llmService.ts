import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
});

export const LearningPathSchema = z.object({
  milestones: z.array(z.string()),
  weeklyGoals: z.array(z.string()),
  recommendedProblemSlugs: z.array(z.string()),
});

export type LearningPathResponse = z.infer<typeof LearningPathSchema>;

export async function generateLearningPath(profile: any, domain: string, assessmentScore: number): Promise<LearningPathResponse> {
  const prompt = `
    Generate a learning path for a student.
    Domain: ${domain}
    Profile: ${JSON.stringify(profile)}
    Assessment Score: ${assessmentScore}

    Respond strictly in JSON format with the following structure:
    {
      "milestones": ["string"],
      "weeklyGoals": ["string"],
      "recommendedProblemSlugs": ["string"]
    }
  `;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const data = JSON.parse(response.text || '{}');
      return LearningPathSchema.parse(data);
    } catch (err) {
      if (attempt === 1) throw err;
      console.warn('Learning Path generation failed, retrying...', err);
    }
  }
  throw new Error('Failed to generate learning path after retries');
}

export async function* streamCopilotChat(
  messages: { role: string; content: string }[],
  context: { profile: any; currentPage: string; lastSubmissionScore: number | null },
  mode: string = 'mentor'
) {
  const systemPrompt = `You are a TalentForge AI Copilot acting as a ${mode}.
Current context:
- Profile: ${JSON.stringify(context.profile)}
- Current Page: ${context.currentPage}
- Last Submission Score: ${context.lastSubmissionScore ?? 'None'}

Be concise, actionable, and adopt the persona of a ${mode}.`;

  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
      ...formattedMessages
    ],
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
