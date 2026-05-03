'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, MicOff, Pause, Play, Sparkles, Square, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  Badge,
  Button,
  Card,
  RecordingPulse,
  TranscriptBubble,
  Waveform,
} from '@/components/ui';

import { api, type ApiEncounter } from '@/lib/api';
import { MOCK_CONVERSATION, type MockSegment } from '@/lib/mock-conversation';

type CaptureState = 'idle' | 'playing' | 'paused' | 'finalising';

export default function CapturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encounterId } = use(params);
  const router = useRouter();
  const [encounter, setEncounter] = useState<ApiEncounter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<CaptureState>('idle');
  const [segments, setSegments] = useState<MockSegment[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      setEncounter(api.getEncounter(encounterId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Encounter not found');
    }
  }, [encounterId]);

  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  // Auto-scroll transcript as new segments arrive.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [segments.length]);

  const totalMs = useMemo(
    () => MOCK_CONVERSATION[MOCK_CONVERSATION.length - 1]?.endMs ?? 0,
    [],
  );

  function startCapture() {
    if (state !== 'idle' && state !== 'paused') return;
    startedAtRef.current = Date.now() - elapsedMs;
    setState('playing');
    if (encounter && encounter.status !== 'in_progress') {
      try {
        api.startEncounter(encounterId);
      } catch {
        /* non-fatal in demo */
      }
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

  // Spacebar toggles play/pause when not in finalising.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      e.preventDefault();
      if (state === 'idle' || state === 'paused') startCapture();
      else if (state === 'playing') pauseCapture();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function endAndGenerate() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    setState('finalising');
    setError(null);
    const t = toast.loading('Generating SOAP note…', { description: 'Sending transcript for review.' });
    try {
      api.bulkTranscript(
        encounterId,
        MOCK_CONVERSATION.map((s) => ({
          speakerLabel: s.speakerLabel,
          speakerRole: s.speakerRole,
          startMs: s.startMs,
          endMs: s.endMs,
          text: s.text,
          isFinal: true,
          confidence: 0.94,
        })),
        true,
      );
      const note = await api.generateNote(encounterId);
      toast.success('Note ready for review.', { id: t });
      router.push(`/app/encounter/${encounterId}/review?note=${note.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to finalise encounter';
      toast.error(msg, { id: t });
      setError(msg);
      setState('paused');
    }
  }

  const partialIndex = segments.length;
  const upcoming = MOCK_CONVERSATION[partialIndex];
  const showLivePartial =
    state === 'playing' && upcoming && elapsedMs < upcoming.endMs && elapsedMs >= upcoming.startMs - 200;
  const patientName = encounter?.patient
    ? `${encounter.patient.givenName} ${encounter.patient.familyName}`
    : 'Encounter';
  const progress = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;

  return (
    <div className="px-8 py-6">
      <button
        type="button"
        onClick={() => router.push('/app/dashboard')}
        className="inline-flex items-center gap-1 text-[12.5px] text-[oklch(50%_0.012_240)] hover:text-[oklch(20%_0.02_240)] transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={1.75} /> Back to today
      </button>

      <header className="mt-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Avatar name={patientName} size="lg" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.015em]">{patientName}</h1>
            <p className="mt-0.5 text-[13px] text-[oklch(45%_0.012_240)] flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Stethoscope size={12} strokeWidth={1.75} />
                {encounter?.reasonForVisit ?? '—'}
              </span>
              {encounter?.patient && (
                <span className="font-mono text-[12px] text-[oklch(58%_0.012_240)]">
                  MRN {encounter.patient.mrn}
                </span>
              )}
            </p>
          </div>
        </div>

        <RecordingChip state={state} elapsedMs={elapsedMs} />
      </header>

      <Card className="mt-6 overflow-hidden">
        {/* status strip */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[oklch(94%_0.008_240)] bg-[oklch(98.5%_0.005_240)]">
          <div className="flex items-center gap-3">
            <Waveform active={state === 'playing'} />
            <div>
              <div className="text-[12.5px] font-medium text-[oklch(20%_0.02_240)]">
                {state === 'playing' ? 'Listening' : state === 'paused' ? 'Paused' : state === 'finalising' ? 'Finalising' : 'Microphone idle'}
              </div>
              <div className="text-[11px] text-[oklch(55%_0.012_240)]">
                Simulated playback · in production this is the live mic
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[13px] tabular-nums text-[oklch(45%_0.012_240)]">
            <span className="font-mono">{formatMs(elapsedMs)}</span>
            <span className="text-[oklch(70%_0.012_240)]">/</span>
            <span className="font-mono">{formatMs(totalMs)}</span>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-0.5 bg-[oklch(95%_0.008_240)] relative">
          <div
            className="h-full bg-gradient-to-r from-[oklch(58%_0.16_255)] to-[oklch(50%_0.14_250)] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* transcript */}
        <div
          ref={transcriptRef}
          className="max-h-[58vh] min-h-[340px] overflow-y-auto px-2 py-2 divide-y divide-[oklch(96%_0.008_240)] scroll-smooth"
        >
          {segments.length === 0 && state === 'idle' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[oklch(96%_0.025_250)] text-[oklch(45%_0.16_255)]">
                <Mic size={22} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-[14.5px] font-medium text-[oklch(20%_0.02_240)]">
                Press Start to begin the visit
              </p>
              <p className="mt-1 text-[12.5px] text-[oklch(55%_0.012_240)]">
                Plays back a sample doctor-patient conversation. Press{' '}
                <kbd className="font-mono text-[11px] bg-[oklch(96%_0.008_240)] rounded px-1.5 py-0.5">Space</kbd> at any time to pause.
              </p>
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

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state === 'idle' && (
            <Button onClick={startCapture} className="gap-1.5">
              <Play size={14} strokeWidth={2} />
              Start
            </Button>
          )}
          {state === 'playing' && (
            <Button variant="secondary" onClick={pauseCapture} className="gap-1.5">
              <Pause size={14} strokeWidth={2} />
              Pause
            </Button>
          )}
          {state === 'paused' && (
            <Button variant="secondary" onClick={startCapture} className="gap-1.5">
              <Play size={14} strokeWidth={2} />
              Resume
            </Button>
          )}
          <Button
            onClick={endAndGenerate}
            disabled={state === 'finalising' || state === 'idle'}
            className="gap-1.5"
          >
            {state === 'finalising' ? (
              <>
                <Sparkles size={14} strokeWidth={2} className="animate-pulse" />
                Generating note…
              </>
            ) : (
              <>
                <Square size={13} strokeWidth={2.25} />
                End encounter & generate note
              </>
            )}
          </Button>
        </div>
        <div className="text-[11.5px] text-[oklch(55%_0.012_240)]">
          <kbd className="font-mono bg-[oklch(96%_0.008_240)] rounded px-1.5 py-0.5">Space</kbd> to{' '}
          {state === 'playing' ? 'pause' : 'play'}
        </div>
      </div>
    </div>
  );
}

function RecordingChip({ state, elapsedMs }: { state: CaptureState; elapsedMs: number }) {
  if (state === 'playing') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(20%_0.02_240)] text-white px-3 py-1.5 text-[12px] font-medium tabular-nums">
        <RecordingPulse />
        <span>Recording</span>
        <span className="text-[oklch(80%_0.012_240)]">·</span>
        <span className="font-mono">{formatMs(elapsedMs)}</span>
      </div>
    );
  }
  if (state === 'paused') {
    return (
      <Badge tone="neutral" className="gap-1.5">
        <Pause size={11} strokeWidth={2.25} />
        Paused · {formatMs(elapsedMs)}
      </Badge>
    );
  }
  if (state === 'finalising') {
    return (
      <Badge tone="accent" className="gap-1.5">
        <Sparkles size={11} strokeWidth={2.25} className="animate-pulse" />
        Generating note
      </Badge>
    );
  }
  return (
    <Badge tone="neutral" className="gap-1.5">
      <MicOff size={11} strokeWidth={2.25} />
      Ready
    </Badge>
  );
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
