import { Prisma } from '@prisma/client';

import type { TenantContext } from '../index.js';

const TENANT_SCOPED_MODELS = new Set([
  'User',
  'Patient',
  'Encounter',
  'TranscriptSegment',
  'Note',
  'NoteTemplate',
  'Integration',
  'WebhookSubscription',
  'AuditEvent',
]);

/**
 * Forces every query against a tenant-scoped model to include
 * `where.tenantId === ctx.tenantId`. Cross-tenant access requires the raw
 * client and a logged superuser action.
 */
export function tenancyExtension(ctx: TenantContext) {
  return Prisma.defineExtension({
    name: 'tenancy',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          const a = args as Record<string, unknown> & {
            where?: Record<string, unknown>;
            data?: Record<string, unknown> | Array<Record<string, unknown>>;
          };

          if (operation.startsWith('find') || operation === 'count' || operation === 'aggregate' || operation === 'groupBy') {
            a.where = { ...(a.where ?? {}), tenantId: ctx.tenantId };
          }

          if (operation === 'create' && a.data && !Array.isArray(a.data)) {
            a.data = { ...a.data, tenantId: ctx.tenantId };
          }

          if (operation === 'createMany' && Array.isArray(a.data)) {
            a.data = a.data.map((row) => ({ ...row, tenantId: ctx.tenantId }));
          }

          if (operation === 'update' || operation === 'updateMany' || operation === 'delete' || operation === 'deleteMany') {
            a.where = { ...(a.where ?? {}), tenantId: ctx.tenantId };
          }

          return query(a);
        },
      },
    },
  });
}
