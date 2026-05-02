import type { Role } from '@clinical-notes/types';

export interface AuthContext {
  userId: string;
  tenantId: string;
  roles: Role[];
  sessionId: string;
}

const PERMISSIONS: Record<Role, string[]> = {
  admin: ['*'],
  clinician: [
    'patient:read',
    'patient:create',
    'patient:update',
    'encounter:*',
    'transcript:read',
    'transcript:create',
    'note:read',
    'note:create',
    'note:update',
    'note:sign',
  ],
  scribe_reviewer: [
    'patient:read',
    'encounter:read',
    'transcript:read',
    'note:read',
    'note:update',
  ],
  billing: ['patient:read', 'encounter:read', 'note:read', 'export:billing'],
  auditor: ['audit:read', 'audit:export'],
};

export function can(ctx: AuthContext, permission: string): boolean {
  for (const role of ctx.roles) {
    const granted = PERMISSIONS[role] ?? [];
    if (granted.includes('*')) return true;
    if (granted.includes(permission)) return true;
    const [resource] = permission.split(':');
    if (resource && granted.includes(`${resource}:*`)) return true;
  }
  return false;
}

export function require(ctx: AuthContext, permission: string): void {
  if (!can(ctx, permission)) {
    throw new ForbiddenError(permission);
  }
}

export class ForbiddenError extends Error {
  constructor(public readonly permission: string) {
    super(`Forbidden: ${permission}`);
    this.name = 'ForbiddenError';
  }
}
