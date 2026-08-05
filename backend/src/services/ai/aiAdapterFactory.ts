import { AIAdapter } from './aiAdapter.interface';
import { OllamaAdapter } from './adapters/ollamaAdapter';
import { ClaudeAdapter } from './adapters/claudeAdapter';
import { GeminiAdapter } from './adapters/geminiAdapter';
import { MockAdapter } from './adapters/mockAdapter';

export class AIAdapterFactory {
  private static instance: AIAdapter | null = null;
  private static currentProviderName: string = '';

  public static getAdapter(): AIAdapter {
    const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase().trim();

    // If adapter instance already cached for current provider, return it
    if (this.instance && this.currentProviderName === provider) {
      return this.instance;
    }

    console.log(`[AIAdapterFactory] Initializing AI Provider: "${provider}"`);

    switch (provider) {
      case 'ollama':
        this.instance = new OllamaAdapter();
        break;
      case 'claude':
      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Missing ANTHROPIC_API_KEY in .env. Please add it and try again.');
        } else {
          this.instance = new ClaudeAdapter();
        }
        break;
      case 'gemini':
      case 'google':
        if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
          throw new Error('Missing GEMINI_API_KEY in .env. Please add it and try again.');
        } else {
          this.instance = new GeminiAdapter();
        }
        break;
      case 'mock':
        this.instance = new MockAdapter();
        break;
      default:
        throw new Error(`Unsupported AI Provider: ${provider}. Please configure AI_PROVIDER correctly.`);
    }

    this.currentProviderName = provider;
    console.log(`[AIAdapterFactory] Active AI Adapter: ${this.instance.getProviderName()}`);

    return this.instance;
  }

  /**
   * Override provider dynamically at runtime (for testing or runtime switching)
   */
  public static setProvider(providerName: string): AIAdapter {
    process.env.AI_PROVIDER = providerName;
    this.instance = null; // reset cache
    return this.getAdapter();
  }
}

export function getAIAdapter(): AIAdapter {
  return AIAdapterFactory.getAdapter();
}
