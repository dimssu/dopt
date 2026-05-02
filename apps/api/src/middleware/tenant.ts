import type { Context, Next } from 'hono';
import { forTenant } from '@clinical-notes/db';

declare module 'hono' {
  interface ContextVariableMap {
    db: ReturnType<typeof forTenant>;
  }
}

export async function tenantMiddleware(c: Context, next: Next) {
  const auth = c.get('auth');
  c.set(
    'db',
    forTenant({ tenantId: auth.tenantId, actorId: auth.userId, actorType: 'user' }),
  );
  await next();
}
