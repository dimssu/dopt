'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  CitationLink,
  TranscriptBubble,
} from '@clinical-notes/ui';

import {
  api,
  type ApiEncounter,
  type ApiNote,
  type ApiTranscriptSegment,
} from '@/lib/api';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [encounter, setEncounter] = useState<ApiEncounter | null>(null);
  const [transcript, setTranscript] = useState<ApiTranscriptSegment[]>([]);
  const [note, setNote] = useState<ApiNote | null>(null);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    Promise.all([
      api.getEncounter(params.id),
      api.listTranscript(params.id),
      api.getNoteByEncounter(params.id).catch(() => null),
    ])
      .then(([enc, tx, n]) => {
        setEncounter(enc);
        setTranscript(tx.data);
        setNote(n);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load encounter'));
  }, [params.id]);

  const onCitation = useCallback((segmentId: string) => {
    setHighlightedSegmentId(segmentId);
    const el = segmentRefs.current[segmentId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  async function generateIfMissing() {
    if (note) return;
    setError(null);
    try {
      const fresh = await api.generateNote(params.id);
      setNote(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    }
  }

  async function sign() {
    if (!note) return;
    setSigning(true);
    try {
      const signed = await api.signNote(note.id);
      setNote(signed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign failed');
    } finally {
      setSigning(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-md border border-[oklch(80%_0.1_25)] bg-[oklch(98%_0.04_25)] px-4 py-3 text-[14px] text-[oklch(40%_0.18_25)]">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/app/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <header className="flex items-baseline justify-between">
        <div>
          <Link href="/app/dashboard" className="text-[13px] text-[oklch(55%_0.012_240)] hover:text-[oklch(20%_0.02_240)]">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.015em]">
            {encounter?.patient
              ? `${encounter.patient.givenName} ${encounter.patient.familyName}`
              : 'Review'}
          </h1>
          <p className="text-[14px] text-[oklch(40%_0.015_240)]">
            {encounter?.reasonForVisit ?? '—'}{' '}
            {encounter?.patient ? `· MRN ${encounter.patient.mrn}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {note?.status === 'signed' && <Badge tone="ok">Signed</Badge>}
          {note?.status === 'draft' && <Badge tone="warn">Draft</Badge>}
          {!note && <Badge tone="neutral">No note yet</Badge>}
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="transcript-heading">
          <h2 id="transcript-heading" className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
            Transcript
          </h2>
          <Card className="mt-3 p-0 overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-[oklch(96%_0.008_240)]">
              {transcript.length === 0 ? (
                <div className="px-6 py-12 text-center text-[14px] text-[oklch(55%_0.012_240)]">
                  No transcript yet for this encounter.
                </div>
              ) : (
                transcript.map((s) => (
                  <div
                    key={s.id}
                    ref={(el) => {
                      segmentRefs.current[s.id] = el;
                    }}
                  >
                    <TranscriptBubble
                      speakerLabel={s.speakerLabel}
                      speakerRole={s.speakerRole}
                      startMs={s.startMs}
                      isFinal={s.isFinal}
                      highlighted={highlightedSegmentId === s.id}
                    >
                      {s.text}
                    </TranscriptBubble>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        <section aria-labelledby="note-heading">
          <h2 id="note-heading" className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
            SOAP note
          </h2>

          {!note ? (
            <Card className="mt-3 p-6 text-center">
              <p className="text-[14px] text-[oklch(40%_0.015_240)]">
                No note generated for this encounter yet.
              </p>
              <div className="mt-4">
                <Button onClick={generateIfMissing} disabled={transcript.length === 0}>
                  Generate note
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="mt-3 divide-y divide-[oklch(92%_0.008_240)]">
                {note.sections.map((section) => (
                  <div key={section.id} className="px-6 py-5">
                    <h3 className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-[1.6] text-[oklch(20%_0.02_240)]">
                      {section.sentences.map((sn) => (
                        <span key={sn.id}>
                          {sn.text}{' '}
                          {sn.citations.map((c, i) => (
                            <CitationLink
                              key={`${sn.id}-${i}`}
                              segmentId={c.segmentId}
                              startMs={c.startMs}
                              endMs={c.endMs}
                              onCitationActivate={onCitation}
                              aria-label={`See transcript at ${formatMs(c.startMs)}`}
                            >
                              [{formatMs(c.startMs)}]
                            </CitationLink>
                          ))}{' '}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </Card>

              {note.codes.length > 0 && (
                <Card className="mt-4 px-6 py-5">
                  <h3 className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
                    Suggested codes
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {note.codes.map((c, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-4 text-[14px]">
                        <div>
                          <span className="font-mono text-[13px] text-[oklch(40%_0.015_240)]">
                            {c.system.toUpperCase()} · {c.code}
                          </span>
                          <span className="ml-2 text-[oklch(20%_0.02_240)]">{c.display}</span>
                        </div>
                        <Badge tone={c.confidence > 0.8 ? 'ok' : c.confidence > 0.6 ? 'warn' : 'neutral'}>
                          {Math.round(c.confidence * 100)}%
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <div className="mt-6 flex items-center gap-3">
                {note.status === 'signed' ? (
                  <p className="text-[13px] text-[oklch(40%_0.015_240)]">
                    Signed{' '}
                    {note.signedAt
                      ? new Date(note.signedAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : ''}
                    .
                  </p>
                ) : (
                  <>
                    <Button onClick={sign} disabled={signing}>
                      {signing ? 'Signing...' : 'Sign note'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={generateIfMissing}
                      disabled={transcript.length === 0}
                    >
                      Regenerate
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </section>
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
