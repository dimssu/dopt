import type { Context, Next } from 'hono';
import type { AuthContext } from '@clinical-notes/auth';

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

/**
 * Verifies the session token (JWT in production; placeholder header in dev)
 * and sets the AuthContext on the request. Real implementation: jose verify
 * against JWKS, MFA enforcement, session revocation, SSO claims.
 */
export async function authMiddleware(c: Context, next: Next) {
  const sessionHeader = c.req.header('x-clinical-session');
  if (!sessionHeader) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  // Dev fallback shape: <userId>:<tenantId>:<role,role>:<sessionId>
  const [userId, tenantId, rolesStr, sessionId] = sessionHeader.split(':');
  if (!userId || !tenantId || !rolesStr || !sessionId) {
    return c.json({ error: 'unauthorized' }, 401);
  }

  c.set('auth', {
    userId,
    tenantId,
    roles: rolesStr.split(',') as AuthContext['roles'],
    sessionId,
  });
  await next();
}
