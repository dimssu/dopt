import { Hono } from 'hono';
import { z } from 'zod';
import { require as requirePerm } from '@clinical-notes/auth';

import { generateSoap } from '../notes/generate.js';

const GenerateRequest = z.object({
  encounterId: z.string().uuid(),
  format: z.enum(['soap', 'hp', 'progress', 'discharge', 'referral', 'custom']).default('soap'),
});

export const notes = new Hono()
  .post('/generate', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'note:create');
    const body = GenerateRequest.parse(await c.req.json());
    const db = c.get('db');

    const transcript = await db.transcriptSegment.findMany({
      where: { encounterId: body.encounterId, isFinal: true },
      orderBy: { startMs: 'asc' },
    });
    if (transcript.length === 0) {
      return c.json({ error: 'no_transcript', message: 'Encounter has no transcript segments yet.' }, 400);
    }

    const generated = await generateSoap(transcript);

    const note = await db.note.create({
      data: {
        tenantId: auth.tenantId,
        encounterId: body.encounterId,
        format: 'soap',
        status: 'draft',
        sections: generated.sections,
        codes: generated.codes,
      },
    });

    await db.encounter.update({
      where: { id: body.encounterId },
      data: { status: 'awaiting_review' },
    });

    return c.json(note, 201);
  })
  .get('/encounter/:encounterId', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'note:read');
    const encounterId = c.req.param('encounterId');
    const db = c.get('db');
    const note = await db.note.findFirst({
      where: { encounterId },
      orderBy: { generatedAt: 'desc' },
    });
    if (!note) return c.json({ error: 'not_found' }, 404);
    return c.json(note);
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
