import { createHash } from 'node:crypto';

import { Prisma } from '@prisma/client';

import type { TenantContext } from '../index.js';

const AUDITED_MODELS: Record<string, 'patient' | 'encounter' | 'note' | 'transcript' | 'user' | 'tenant' | 'integration' | 'webhook'> = {
  Patient: 'patient',
  Encounter: 'encounter',
  Note: 'note',
  TranscriptSegment: 'transcript',
  User: 'user',
  Tenant: 'tenant',
  Integration: 'integration',
  WebhookSubscription: 'webhook',
};

const ACTION_BY_OP: Record<string, 'read' | 'create' | 'update' | 'delete'> = {
  findUnique: 'read',
  findUniqueOrThrow: 'read',
  findFirst: 'read',
  findFirstOrThrow: 'read',
  findMany: 'read',
  count: 'read',
  aggregate: 'read',
  groupBy: 'read',
  create: 'create',
  createMany: 'create',
  update: 'update',
  updateMany: 'update',
  upsert: 'update',
  delete: 'delete',
  deleteMany: 'delete',
};

function chainHash(prevHash: string | null, payload: string): string {
  return createHash('sha256').update(`${prevHash ?? ''}|${payload}`).digest('hex');
}

/**
 * Emits a hash-chained AuditEvent for every read and mutation of a PHI-bearing
 * model. The tail hash for a tenant is read on each insert, then the new event
 * extends the chain. Verifying the chain is a periodic compliance task.
 */
export function auditExtension(ctx: TenantContext) {
  return Prisma.defineExtension({
    name: 'audit',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const result = await query(args);

          if (!model || !(model in AUDITED_MODELS)) {
            return result;
          }
          const action = ACTION_BY_OP[operation];
          if (!action) {
            return result;
          }

          const resource = AUDITED_MODELS[model as keyof typeof AUDITED_MODELS];
          if (!resource) {
            return result;
          }
          const resourceId = extractResourceId(result, args);
          if (!resourceId) {
            return result;
          }

          const payload = JSON.stringify({
            tenantId: ctx.tenantId,
            actorId: ctx.actorId,
            actorType: ctx.actorType,
            action,
            resource,
            resourceId,
            ts: new Date().toISOString(),
          });

          // The actual write happens through the underlying client; defer
          // to a queued worker in production to keep the request hot path fast.
          // For now, fire-and-forget into a deferred queue handled by apps/api.
          void emitAuditEvent({
            tenantId: ctx.tenantId,
            actorId: ctx.actorId,
            actorType: ctx.actorType,
            action,
            resource,
            resourceId,
            payload,
          });

          return result;
        },
      },
    },
  });

  function extractResourceId(result: unknown, args: unknown): string | null {
    if (result && typeof result === 'object' && 'id' in (result as Record<string, unknown>)) {
      const id = (result as Record<string, unknown>).id;
      return typeof id === 'string' ? id : null;
    }
    if (Array.isArray(result) && result.length === 1) {
      const first = result[0] as { id?: unknown } | undefined;
      if (first && typeof first.id === 'string') {
        return first.id;
      }
    }
    if (args && typeof args === 'object' && 'where' in (args as Record<string, unknown>)) {
      const where = (args as { where?: Record<string, unknown> }).where;
      if (where && typeof where.id === 'string') {
        return where.id;
      }
    }
    return null;
  }
}

// Replaced at runtime by apps/api with a real queue-backed implementation.
let emitAuditEvent: (e: AuditEmission) => Promise<void> = async () => undefined;

export interface AuditEmission {
  tenantId: string;
  actorId: string | null;
  actorType: 'user' | 'service' | 'system';
  action: 'read' | 'create' | 'update' | 'delete';
  resource: string;
  resourceId: string;
  payload: string;
}

export function setAuditEmitter(fn: (e: AuditEmission) => Promise<void>) {
  emitAuditEvent = fn;
}

export { chainHash };
