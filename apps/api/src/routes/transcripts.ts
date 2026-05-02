import { Hono } from 'hono';
import { z } from 'zod';
import { require as requirePerm } from '@clinical-notes/auth';

const SegmentInput = z.object({
  speakerLabel: z.string().min(1).max(64),
  speakerRole: z.enum(['clinician', 'patient', 'caregiver', 'other']),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
  text: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.95),
  isFinal: z.boolean().default(true),
});

const BulkRequest = z.object({
  encounterId: z.string().uuid(),
  segments: z.array(SegmentInput).min(1),
  replace: z.boolean().default(false),
});

export const transcripts = new Hono()
  .get('/:encounterId', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'transcript:read');
    const encounterId = c.req.param('encounterId');
    const db = c.get('db');
    const segments = await db.transcriptSegment.findMany({
      where: { encounterId },
      orderBy: { startMs: 'asc' },
    });
    return c.json({ data: segments });
  })
  .post('/bulk', async (c) => {
    const auth = c.get('auth');
    requirePerm(auth, 'transcript:create');
    const body = BulkRequest.parse(await c.req.json());
    const db = c.get('db');

    if (body.replace) {
      await db.transcriptSegment.deleteMany({ where: { encounterId: body.encounterId } });
    }

    const created = await Promise.all(
      body.segments.map((s) =>
        db.transcriptSegment.create({
          data: {
            encounterId: body.encounterId,
            speakerLabel: s.speakerLabel,
            speakerRole: s.speakerRole,
            startMs: s.startMs,
            endMs: s.endMs,
            text: s.text,
            confidence: s.confidence,
            isFinal: s.isFinal,
          },
        }),
      ),
    );

    return c.json({ count: created.length }, 201);
  });
