import { Hono } from 'hono';
import { z } from 'zod';
import { require as requirePerm } from '@clinical-notes/auth';

const GenerateRequest = z.object({
  encounterId: z.string().uuid(),
  format: z.enum(['soap', 'hp', 'progress', 'discharge', 'referral', 'custom']).default('soap'),
  templateId: z.string().uuid().optional(),
});

export const notes = new Hono()
  .post('/generate', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'note:create');
    const body = GenerateRequest.parse(await c.req.json());

    // Hand off to notes-svc; the worker queue does the heavy lifting and writes
    // the resulting Note + AuditEvent on completion.
    const url = new URL('/generate', process.env.NOTES_SVC_URL ?? 'http://localhost:8002');
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-tenant-id': auth.tenantId },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      return c.json({ error: 'notes_svc_unavailable' }, 502);
    }
    return c.json(await resp.json(), 202);
  })
  .get('/:id', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'note:read');
    const id = c.req.param('id');
    const db = c.get('db');
    const note = await db.note.findUnique({ where: { id } });
    if (!note) return c.json({ error: 'not_found' }, 404);
    return c.json(note);
  })
  .post('/:id/sign', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'note:sign');
    const id = c.req.param('id');
    const db = c.get('db');
    const note = await db.note.update({
      where: { id },
      data: { status: 'signed', signedAt: new Date(), signedById: auth.userId },
    });
    return c.json(note);
  });
