import { createHash } from 'node:crypto';

/**
 * Hash-chained audit trail. Each event's `hash` covers the previous event's
 * hash plus a canonical JSON of the new event. A break in the chain is
 * detectable on verification — useful for tamper evidence in audit exports.
 */
export interface AuditChainable {
  prevHash: string | null;
  hash: string;
  occurredAt: Date | string;
  tenantId: string;
  resource: string;
  resourceId: string;
  action: string;
  actorId: string | null;
  actorType: string;
  metadata: Record<string, unknown>;
}

export function canonicalPayload(e: Omit<AuditChainable, 'hash'>): string {
  return JSON.stringify({
    tenantId: e.tenantId,
    actorId: e.actorId,
    actorType: e.actorType,
    action: e.action,
    resource: e.resource,
    resourceId: e.resourceId,
    metadata: e.metadata,
    occurredAt: e.occurredAt instanceof Date ? e.occurredAt.toISOString() : e.occurredAt,
    prevHash: e.prevHash,
  });
}

export function hashEvent(e: Omit<AuditChainable, 'hash'>): string {
  return createHash('sha256').update(canonicalPayload(e)).digest('hex');
}

export function verifyChain(events: AuditChainable[]): { valid: boolean; brokenAt: number | null } {
  let prev: string | null = null;
  for (let i = 0; i < events.length; i++) {
    const e = events[i]!;
    if (e.prevHash !== prev) {
      return { valid: false, brokenAt: i };
    }
    const expected = hashEvent({ ...e, prevHash: prev });
    if (expected !== e.hash) {
      return { valid: false, brokenAt: i };
    }
    prev = e.hash;
  }
  return { valid: true, brokenAt: null };
}
