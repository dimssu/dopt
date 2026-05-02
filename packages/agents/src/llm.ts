import Anthropic from '@anthropic-ai/sdk';
import type { ProviderRouting } from '@clinical-notes/config';
import { assertAllowed } from '@clinical-notes/compliance';
import type { DataResidency } from '@clinical-notes/types';

export interface LLMRequest {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  cacheControl?: boolean;
}

export interface LLMResponse {
  text: string;
  usage: { input: number; output: number; cacheRead: number; cacheCreate: number };
  model: string;
}

export interface LLMClientOptions {
  region: DataResidency;
  providers: ProviderRouting;
  apiKey: string;
}

/**
 * Provider-abstracted LLM client. Defaults to Anthropic and respects per-tenant
 * residency. Adding a provider is a compliance-officer-approved change.
 */
export class LLMClient {
  private readonly anthropic: Anthropic;

  constructor(private readonly opts: LLMClientOptions) {
    assertAllowed(opts.region, 'llm', `${opts.providers.llmProvider}:${opts.region === 'eu' || opts.region === 'uk' ? 'eu' : 'us'}`);
    this.anthropic = new Anthropic({ apiKey: opts.apiKey });
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const res = await this.anthropic.messages.create({
      model: this.opts.providers.llmModel,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      system: req.cacheControl
        ? [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }]
        : req.system,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const textBlock = res.content.find((b) => b.type === 'text');
    return {
      text: textBlock && textBlock.type === 'text' ? textBlock.text : '',
      usage: {
        input: res.usage.input_tokens,
        output: res.usage.output_tokens,
        cacheRead: res.usage.cache_read_input_tokens ?? 0,
        cacheCreate: res.usage.cache_creation_input_tokens ?? 0,
      },
      model: res.model,
    };
  }
}
