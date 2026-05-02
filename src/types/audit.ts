import { z } from 'zod';

export const AuditAction = z.enum([
  'read',
  'create',
  'update',
  'delete',
  'sign',
  'amend',
  'export',
  'login',
  'logout',
  'config_change',
]);
export type AuditAction = z.infer<typeof AuditAction>;

export const AuditResource = z.enum([
  'tenant',
  'user',
  'patient',
  'encounter',
  'transcript',
  'note',
  'integration',
  'webhook',
  'audit',
]);
export type AuditResource = z.infer<typeof AuditResource>;

export const AuditEvent = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  actorId: z.string().uuid().nullable(),
  actorType: z.enum(['user', 'service', 'system']),
  action: AuditAction,
  resource: AuditResource,
  resourceId: z.string(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.unknown()).default({}),
  prevHash: z.string().nullable(),
  hash: z.string(),
  occurredAt: z.coerce.date(),
});
export type AuditEvent = z.infer<typeof AuditEvent>;
