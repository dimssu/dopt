import { Hono } from 'hono';
import { z } from 'zod';
import { require as requirePerm } from '@clinical-notes/auth';

const PatientCreate = z.object({
  mrn: z.string().min(1).max(64),
  givenName: z.string().min(1).max(100),
  familyName: z.string().min(1).max(100),
  birthDate: z.string(),
  sex: z.enum(['female', 'male', 'other', 'unknown']),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
});

export const patients = new Hono()
  .get('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'patient:read');
    const db = c.get('db');
    const list = await db.patient.findMany({ orderBy: { familyName: 'asc' } });
    return c.json({ data: list });
  })
  .post('/', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'patient:create');
    const body = PatientCreate.parse(await c.req.json());
    const db = c.get('db');
    const created = await db.patient.create({
      data: { ...body, birthDate: new Date(body.birthDate) },
    });
    return c.json(created, 201);
  })
  .get('/:id', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'patient:read');
    const id = c.req.param('id');
    const db = c.get('db');
    const patient = await db.patient.findUnique({ where: { id } });
    if (!patient) return c.json({ error: 'not_found' }, 404);
    return c.json(patient);
  });
