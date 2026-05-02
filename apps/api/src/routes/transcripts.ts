import { Hono } from 'hono';
import { require as requirePerm } from '@clinical-notes/auth';

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
  });
