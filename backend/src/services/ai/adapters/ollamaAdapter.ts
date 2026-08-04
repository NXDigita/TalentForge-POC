import axios from 'axios';
import { AIAdapter, AIMessage, AIRequestOptions } from '../aiAdapter.interface';
import { MockAdapter } from './mockAdapter';

export class OllamaAdapter implements AIAdapter {
  private baseUrl: string;
  private model: string;
  private fallbackMock: MockAdapter;

  constructor() {
    this.baseUrl = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3';
    this.fallbackMock = new MockAdapter();
  }

  getProviderName(): string {
    return `ollama (${this.model})`;
  }

  async generateText(prompt: string, options?: AIRequestOptions): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        system: options?.systemPrompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
        },
      }, { timeout: 30000 });

      return response.data?.response || '';
    } catch (err: any) {
      console.warn(`[OllamaAdapter] Local Ollama (${this.baseUrl}) unavailable: ${err.message}. Falling back to MockAdapter.`);
      return this.fallbackMock.generateText(prompt, options);
    }
  }

  async generateJSON<T>(prompt: string, schema?: any, options?: AIRequestOptions): Promise<T> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: `${prompt}\nRespond strictly with valid JSON. Do not include markdown code block formatting or explanation.`,
        system: options?.systemPrompt,
        format: 'json',
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.2,
        },
      }, { timeout: 30000 });

      const rawText = response.data?.response || '{}';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as T;
    } catch (err: any) {
      console.warn(`[OllamaAdapter] JSON generation failed via Ollama: ${err.message}. Falling back to MockAdapter.`);
      return this.fallbackMock.generateJSON<T>(prompt, schema, options);
    }
  }

  async *streamText(
    messages: AIMessage[],
    context?: any,
    options?: AIRequestOptions
  ): AsyncGenerator<string, void, unknown> {
    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      }));

      if (options?.systemPrompt) {
        formattedMessages.unshift({ role: 'system', content: options.systemPrompt });
      }

      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: this.model,
          messages: formattedMessages,
          stream: true,
        },
        { responseType: 'stream', timeout: 45000 }
      );

      let buffer = '';
      for await (const chunk of response.data) {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const content = parsed.message?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore parse errors on partial JSON chunks
          }
        }
      }
    } catch (err: any) {
      console.warn(`[OllamaAdapter] Streaming failed via Ollama: ${err.message}. Falling back to MockAdapter.`);
      yield* this.fallbackMock.streamText(messages, context, options);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.fallbackMock.generateEmbedding(text);
  }
}
