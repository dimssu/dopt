import type { Context } from 'hono';
import { ForbiddenError } from '@clinical-notes/auth';
import { ResidencyViolation } from '@clinical-notes/compliance';

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof ForbiddenError) {
    return c.json({ error: 'forbidden', permission: err.permission }, 403);
  }
  if (err instanceof ResidencyViolation) {
    return c.json({ error: 'residency_violation', region: err.region, target: err.target }, 451);
  }
  c.var.auth && console.error({ tenantId: c.var.auth?.tenantId, error: err.message });
  return c.json({ error: 'internal_error' }, 500);
}
