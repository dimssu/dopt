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
    // SDK 0.32 hasn't pulled cache_control onto TextBlockParam in its public
    // types yet; the runtime accepts it. Cast through `unknown` to keep the
    // call sites readable. Drops when we upgrade the SDK.
    const systemForRequest = req.cacheControl
      ? ([
          { type: 'text', text: req.system, cache_control: { type: 'ephemeral' } },
        ] as unknown as string)
      : req.system;

    const res = await this.anthropic.messages.create({
      model: this.opts.providers.llmModel,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.2,
      system: systemForRequest,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const textBlock = res.content.find((b) => b.type === 'text');
    const usage = res.usage as {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
    return {
      text: textBlock && textBlock.type === 'text' ? textBlock.text : '',
      usage: {
        input: usage.input_tokens,
        output: usage.output_tokens,
        cacheRead: usage.cache_read_input_tokens ?? 0,
        cacheCreate: usage.cache_creation_input_tokens ?? 0,
      },
      model: res.model,
    };
  }
}
