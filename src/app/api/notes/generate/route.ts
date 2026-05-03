import { NextResponse } from 'next/server';

import { generateSoap, type TranscriptSegmentInput } from '@/lib/note-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface GenerateRequest {
  transcript: TranscriptSegmentInput[];
  format?: 'soap';
}

export async function POST(req: Request) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!Array.isArray(body.transcript) || body.transcript.length === 0) {
    return NextResponse.json(
      { error: 'no_transcript', message: 'transcript must be a non-empty array of segments.' },
      { status: 400 },
    );
  }

  // Defensive normalisation — client may send extra fields (speakerRole, etc).
  const transcript: TranscriptSegmentInput[] = body.transcript
    .filter(
      (s) =>
        s &&
        typeof s.id === 'string' &&
        typeof s.text === 'string' &&
        typeof s.startMs === 'number' &&
        typeof s.endMs === 'number',
    )
    .map((s) => ({
      id: s.id,
      speakerLabel: typeof s.speakerLabel === 'string' ? s.speakerLabel : 'Speaker',
      startMs: s.startMs,
      endMs: s.endMs,
      text: s.text,
    }));

  if (transcript.length === 0) {
    return NextResponse.json({ error: 'no_transcript' }, { status: 400 });
  }

  try {
    const note = await generateSoap(transcript);
    return NextResponse.json(note);
  } catch (err) {
    console.error('generation failed', err);
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 });
  }
}
