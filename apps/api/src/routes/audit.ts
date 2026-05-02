import { Hono } from 'hono';
import { require as requirePerm } from '@clinical-notes/auth';

export const audit = new Hono()
  .get('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'audit:read');
    const db = c.get('db');
    const events = await db.auditEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 200,
    });
    return c.json({ data: events });
  });
