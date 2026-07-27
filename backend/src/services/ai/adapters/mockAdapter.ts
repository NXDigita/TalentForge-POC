import { AIAdapter, AIMessage, AIRequestOptions } from '../aiAdapter.interface';

export class MockAdapter implements AIAdapter {
  getProviderName(): string {
    return 'mock';
  }

  async generateText(prompt: string, options?: AIRequestOptions): Promise<string> {
    return `[Mock AI Response] Evaluated prompt (${prompt.slice(0, 40)}...). High technical aptitude verified.`;
  }

  async generateJSON<T>(prompt: string, schema?: any, options?: AIRequestOptions): Promise<T> {
    // If generating learning path
    if (prompt.toLowerCase().includes('learning path') || prompt.toLowerCase().includes('milestones')) {
      const mockLearningPath = {
        milestones: [
          'Phase 1: Advanced Data Structures & Memory Alignment',
          'Phase 2: High-Concurreny Event-Driven Systems',
          'Phase 3: Distributed Consensus & Fault Tolerance',
        ],
        weeklyGoals: [
          'Week 1: Solve 5 Two-Pointer & Hash Map challenges with O(N) efficiency',
          'Week 2: Implement LRU Cache & Lock-Free Queue primitives',
          'Week 3: Complete System Design mock for Distributed Log Streaming',
        ],
        recommendedProblemSlugs: ['two-sum', 'lru-cache', 'merge-k-sorted-lists'],
      };
      return mockLearningPath as unknown as T;
    }

    return { message: 'Mock JSON response', status: 'success' } as unknown as T;
  }

  async *streamText(
    messages: AIMessage[],
    context?: any,
    options?: AIRequestOptions
  ): AsyncGenerator<string, void, unknown> {
    const lastMsg = messages[messages.length - 1]?.content || 'your query';
    const mode = options?.systemPrompt?.includes('mentor') ? 'Mentor' : 'Copilot';

    const responseText = `Hello! I am your TalentForge AI ${mode} (Mock Mode). I received your query: "${lastMsg}". ` +
      `Focus on optimizing your data structure choices and verifying boundary conditions O(N). Keep building!`;

    const words = responseText.split(' ');
    for (const word of words) {
      yield word + ' ';
      await new Promise((r) => setTimeout(r, 40));
    }
  }
}
