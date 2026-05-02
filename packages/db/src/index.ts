import { PrismaClient } from '@prisma/client';

import { tenancyExtension } from './middleware/tenancy.js';
import { auditExtension } from './middleware/audit.js';

export type TenantContext = {
  tenantId: string;
  actorId: string | null;
  actorType: 'user' | 'service' | 'system';
};

let baseClient: PrismaClient | null = null;

function base(): PrismaClient {
  baseClient ??= new PrismaClient({
    log: ['warn', 'error'],
  });
  return baseClient;
}

/**
 * Returns a Prisma client that automatically scopes every query to the given
 * tenant and emits a hash-chained audit event for every mutation. All app
 * code MUST go through this — never the raw client.
 */
export function forTenant(ctx: TenantContext) {
  return base().$extends(tenancyExtension(ctx)).$extends(auditExtension(ctx));
}

export { Prisma } from '@prisma/client';
export type {
  Tenant,
  User,
  Patient,
  Encounter,
  TranscriptSegment,
  Note,
  NoteTemplate,
  Integration,
  WebhookSubscription,
  AuditEvent,
} from '@prisma/client';
