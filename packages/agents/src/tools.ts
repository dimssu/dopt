import { z } from 'zod';

export interface AgentTool<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  run: (input: TInput, ctx: ToolContext) => Promise<TOutput>;
}

export interface ToolContext {
  tenantId: string;
  actorId: string | null;
  encounterId: string | null;
}

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool<unknown, unknown>>();

  register<I, O>(tool: AgentTool<I, O>): void {
    this.tools.set(tool.name, tool as AgentTool<unknown, unknown>);
  }

  get(name: string): AgentTool<unknown, unknown> | undefined {
    return this.tools.get(name);
  }

  list(): AgentTool<unknown, unknown>[] {
    return Array.from(this.tools.values());
  }
}
