'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Card, TranscriptBubble } from '@clinical-notes/ui';

import { api, type ApiEncounter } from '@/lib/api';
import { MOCK_CONVERSATION, type MockSegment } from '@/lib/mock-conversation';

type CaptureState = 'idle' | 'playing' | 'paused' | 'finalising';

export default function CapturePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [encounter, setEncounter] = useState<ApiEncounter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<CaptureState>('idle');
  const [segments, setSegments] = useState<MockSegment[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.getEncounter(params.id).then(setEncounter).catch((e) => setError(e.message));
  }, [params.id]);

  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const totalMs = useMemo(
    () => MOCK_CONVERSATION[MOCK_CONVERSATION.length - 1]?.endMs ?? 0,
    [],
  );

  function startCapture() {
    if (state !== 'idle' && state !== 'paused') return;
    startedAtRef.current = Date.now() - elapsedMs;
    setState('playing');
    if (encounter && encounter.status !== 'in_progress') {
      api.startEncounter(params.id).catch(() => {});
    }
    tickerRef.current = setInterval(() => {
      const now = Date.now() - (startedAtRef.current ?? 0);
      setElapsedMs(now);
      const visible = MOCK_CONVERSATION.filter((s) => s.startMs <= now);
      setSegments(visible);
      if (visible.length === MOCK_CONVERSATION.length) {
        if (tickerRef.current) clearInterval(tickerRef.current);
        tickerRef.current = null;
        setState('paused');
      }
    }, 200);
  }

  function pauseCapture() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = null;
    setState('paused');
  }

  async function endAndGenerate() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    setState('finalising');
    setError(null);
    try {
      await api.bulkTranscript(params.id, MOCK_CONVERSATION.map((s) => ({
        speakerLabel: s.speakerLabel,
        speakerRole: s.speakerRole,
        startMs: s.startMs,
        endMs: s.endMs,
        text: s.text,
        isFinal: true,
        confidence: 0.94,
      })), true);
      await api.endEncounter(params.id);
      const note = await api.generateNote(params.id);
      router.push(`/app/encounter/${params.id}/review?note=${note.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to finalise encounter');
      setState('paused');
    }
  }

  const partialIndex = segments.length;
  const upcoming = MOCK_CONVERSATION[partialIndex];
  const showLivePartial = state === 'playing' && upcoming && elapsedMs < upcoming.endMs && elapsedMs >= upcoming.startMs - 200;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.015em]">
            {encounter?.patient ? `${encounter.patient.givenName} ${encounter.patient.familyName}` : 'Encounter'}
          </h1>
          <p className="text-[14px] text-[oklch(40%_0.015_240)]">
            {encounter?.reasonForVisit ?? '...'} {encounter?.patient ? `· MRN ${encounter.patient.mrn}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state === 'playing' && <Badge tone="warn">Recording · {formatMs(elapsedMs)}</Badge>}
          {state === 'paused' && <Badge tone="neutral">Paused · {formatMs(elapsedMs)}</Badge>}
          {state === 'finalising' && <Badge tone="accent">Generating note...</Badge>}
          {state === 'idle' && <Badge tone="neutral">Ready</Badge>}
        </div>
      </header>

      <Card className="mt-8 p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[oklch(92%_0.008_240)] px-5 py-3">
          <div className="text-[13px] text-[oklch(55%_0.012_240)]">
            Live transcript · simulated playback
          </div>
          <div className="text-[13px] text-[oklch(55%_0.012_240)]">
            {formatMs(elapsedMs)} / {formatMs(totalMs)}
          </div>
        </div>
        <div className="max-h-[60vh] min-h-[320px] overflow-y-auto px-2 py-2 divide-y divide-[oklch(96%_0.008_240)]">
          {segments.length === 0 && state === 'idle' && (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[14px] text-[oklch(55%_0.012_240)]">
              <p>Press <strong>Start</strong> to play back a sample doctor-patient conversation.</p>
              <p className="mt-1 text-[12px]">In production this captures from the microphone via the transcription service.</p>
            </div>
          )}
          {segments.map((s, i) => {
            const isLast = i === segments.length - 1;
            const isPartial = isLast && showLivePartial && upcoming && upcoming.startMs === s.startMs;
            return (
              <TranscriptBubble
                key={`${s.startMs}-${i}`}
                speakerLabel={s.speakerLabel}
                speakerRole={s.speakerRole}
                startMs={s.startMs}
                isFinal={!isPartial}
              >
                {s.text}
              </TranscriptBubble>
            );
          })}
        </div>
      </Card>

      {error && (
        <div className="mt-4 rounded-md border border-[oklch(80%_0.1_25)] bg-[oklch(98%_0.04_25)] px-4 py-3 text-[13px] text-[oklch(40%_0.18_25)]">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        {state === 'idle' && (
          <Button onClick={startCapture}>Start</Button>
        )}
        {state === 'playing' && (
          <Button variant="secondary" onClick={pauseCapture}>Pause</Button>
        )}
        {state === 'paused' && (
          <Button variant="secondary" onClick={startCapture}>Resume</Button>
        )}
        <Button
          onClick={endAndGenerate}
          disabled={state === 'finalising' || state === 'idle'}
        >
          {state === 'finalising' ? 'Generating note...' : 'End encounter & generate note'}
        </Button>
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
