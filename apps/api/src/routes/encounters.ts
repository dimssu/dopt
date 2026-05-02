import { Hono } from 'hono';
import { z } from 'zod';
import { require as requirePerm } from '@clinical-notes/auth';

const EncounterCreate = z.object({
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  mode: z.enum(['in_person', 'telehealth', 'home_visit']).default('in_person'),
  scheduledAt: z.string().optional(),
  reasonForVisit: z.string().max(500).optional(),
});

export const encounters = new Hono()
  .get('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'encounter:read');
    const db = c.get('db');
    const list = await db.encounter.findMany({
      orderBy: [{ startedAt: 'desc' }, { scheduledAt: 'desc' }],
      include: { patient: true, clinician: true },
    });
    return c.json({ data: list });
  })
  .post('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'encounter:create');
    const body = EncounterCreate.parse(await c.req.json());
    const db = c.get('db');
    const created = await db.encounter.create({
      data: {
        patientId: body.patientId,
        clinicianId: body.clinicianId,
        mode: body.mode,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        reasonForVisit: body.reasonForVisit,
        status: 'scheduled',
      },
    });
    return c.json(created, 201);
  })
  .get('/:id', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'encounter:read');
    const id = c.req.param('id');
    const db = c.get('db');
    const enc = await db.encounter.findUnique({
      where: { id },
      include: { patient: true, clinician: true },
    });
    if (!enc) return c.json({ error: 'not_found' }, 404);
    return c.json(enc);
  })
  .post('/:id/start', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'encounter:update');
    const id = c.req.param('id');
    const db = c.get('db');
    const updated = await db.encounter.update({
      where: { id },
      data: { status: 'in_progress', startedAt: new Date() },
    });
    return c.json(updated);
  })
  .post('/:id/end', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'encounter:update');
    const id = c.req.param('id');
    const db = c.get('db');
    const updated = await db.encounter.update({
      where: { id },
      data: { status: 'awaiting_review', endedAt: new Date() },
    });
    return c.json(updated);
  });
