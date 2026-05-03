'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileSignature,
  Quote,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CitationLink,
  TranscriptBubble,
} from '@/components/ui';

import {
  api,
  type ApiEncounter,
  type ApiNote,
  type ApiTranscriptSegment,
} from '@/lib/api';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encounterId } = use(params);
  const [encounter, setEncounter] = useState<ApiEncounter | null>(null);
  const [transcript, setTranscript] = useState<ApiTranscriptSegment[]>([]);
  const [note, setNote] = useState<ApiNote | null>(null);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const refresh = useCallback(() => {
    try {
      setEncounter(api.getEncounter(encounterId));
      setTranscript(api.listTranscript(encounterId).data);
      setNote(api.getNoteByEncounter(encounterId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load encounter');
    }
  }, [encounterId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCitation = useCallback((segmentId: string) => {
    setHighlightedSegmentId(segmentId);
    const el = segmentRefs.current[segmentId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // pulse the highlight then settle so the user sees the connection.
    window.setTimeout(() => setHighlightedSegmentId(null), 2400);
  }, []);

  function jumpToSection(key: string) {
    const el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function generate(message: string) {
    setError(null);
    setRegenerating(true);
    const t = toast.loading(message);
    try {
      const fresh = await api.generateNote(encounterId);
      setNote(fresh);
      toast.success('Note ready for review.', { id: t });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      toast.error(msg, { id: t });
      setError(msg);
    } finally {
      setRegenerating(false);
    }
  }

  function sign() {
    if (!note) return;
    setSigning(true);
    try {
      const signed = api.signNote(note.id);
      setNote(signed);
      toast.success('Note signed.', {
        description: `Locked at ${new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}. The audit trail is updated.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign failed';
      toast.error(msg);
      setError(msg);
    } finally {
      setSigning(false);
    }
  }

  const patientName = useMemo(
    () => (encounter?.patient ? `${encounter.patient.givenName} ${encounter.patient.familyName}` : 'Encounter'),
    [encounter],
  );

  if (error && !encounter) {
    return (
      <div className="px-8 py-10 max-w-2xl">
        <div className="rounded-md border border-[oklch(80%_0.1_25)] bg-[oklch(98%_0.04_25)] px-4 py-3 text-[14px] text-[oklch(40%_0.18_25)]">
          {error}
        </div>
        <div className="mt-4">
          <Link href="/app/dashboard">
            <Button variant="secondary">Back to today</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-1 text-[12.5px] text-[oklch(50%_0.012_240)] hover:text-[oklch(20%_0.02_240)] transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={1.75} /> Back to today
      </Link>

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

        <div className="flex items-center gap-3">
          {note?.status === 'signed' && (
            <Badge tone="ok" className="gap-1.5">
              <CheckCircle2 size={11} strokeWidth={2.25} />
              Signed
            </Badge>
          )}
          {note?.status === 'draft' && (
            <Badge tone="warn" className="gap-1.5">
              <ClipboardList size={11} strokeWidth={2.25} />
              Draft
            </Badge>
          )}
          {!note && (
            <Badge tone="neutral" className="gap-1.5">
              <Sparkles size={11} strokeWidth={2.25} />
              No note yet
            </Badge>
          )}
          {note && note.status !== 'signed' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => generate('Regenerating note…')}
                disabled={regenerating || transcript.length === 0}
                className="gap-1.5"
              >
                <RefreshCw size={13} strokeWidth={1.75} className={regenerating ? 'animate-spin' : ''} />
                Regenerate
              </Button>
              <Button onClick={sign} disabled={signing} size="sm" className="gap-1.5">
                <FileSignature size={13} strokeWidth={2} />
                {signing ? 'Signing…' : 'Sign note'}
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_180px] gap-6">
        {/* transcript */}
        <section aria-labelledby="transcript-heading" className="min-w-0">
          <h2
            id="transcript-heading"
            className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[oklch(40%_0.015_240)] mb-3"
          >
            <Quote size={13} strokeWidth={1.75} className="text-[oklch(55%_0.012_240)]" />
            Transcript
          </h2>
          <Card className="p-0 overflow-hidden">
            <div className="max-h-[72vh] overflow-y-auto divide-y divide-[oklch(96%_0.008_240)]">
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

        {/* note */}
        <section aria-labelledby="note-heading" className="min-w-0">
          <h2
            id="note-heading"
            className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[oklch(40%_0.015_240)] mb-3"
          >
            <Sparkles size={12} strokeWidth={2} className="text-[oklch(50%_0.14_250)]" />
            SOAP note
            {note && note.status !== 'signed' && (
              <span className="text-[10px] font-mono text-[oklch(60%_0.012_240)] ml-1">
                generated {relativeTime(new Date(note.generatedAt))}
              </span>
            )}
          </h2>

          {!note ? (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[oklch(96%_0.025_250)] text-[oklch(45%_0.16_255)]">
                <Sparkles size={20} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-[14.5px] font-medium">No note generated yet</p>
              <p className="mt-1 text-[12.5px] text-[oklch(55%_0.012_240)]">
                Once the encounter has a transcript, generate the SOAP note here.
              </p>
              <div className="mt-5">
                <Button
                  onClick={() => generate('Generating note…')}
                  disabled={transcript.length === 0 || regenerating}
                  className="gap-1.5"
                >
                  <Sparkles size={14} strokeWidth={2} />
                  Generate note
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="divide-y divide-[oklch(94%_0.008_240)]">
                {note.sections.map((section) => (
                  <div
                    key={section.id}
                    ref={(el) => {
                      sectionRefs.current[section.key] = el;
                    }}
                    className="px-6 py-5 scroll-mt-24"
                  >
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[oklch(45%_0.13_250)]">
                      {section.title}
                    </h3>
                    <p className="mt-2 text-[14.5px] leading-[1.6] text-[oklch(20%_0.02_240)]">
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[oklch(40%_0.015_240)]">
                      Suggested codes
                    </h3>
                    <span className="text-[10.5px] text-[oklch(58%_0.012_240)]">
                      Review before submitting
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {note.codes.map((c, i) => (
                      <li
                        key={i}
                        className="inline-flex items-center gap-2 rounded-md border border-[oklch(94%_0.008_240)] bg-[oklch(98.5%_0.005_240)] px-2.5 py-1.5"
                      >
                        <span className="text-[10px] font-mono uppercase tracking-[0.04em] font-semibold text-[oklch(45%_0.13_250)]">
                          {c.system}
                        </span>
                        <span className="text-[12px] font-mono text-[oklch(20%_0.02_240)]">
                          {c.code}
                        </span>
                        <span className="text-[12px] text-[oklch(40%_0.015_240)]">{c.display}</span>
                        <span
                          className={`text-[10px] font-semibold tabular-nums ${
                            c.confidence > 0.8
                              ? 'text-[oklch(40%_0.13_155)]'
                              : c.confidence > 0.6
                              ? 'text-[oklch(40%_0.13_70)]'
                              : 'text-[oklch(55%_0.012_240)]'
                          }`}
                        >
                          {Math.round(c.confidence * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {note.status === 'signed' && (
                <div className="mt-5 inline-flex items-start gap-3 rounded-lg bg-[oklch(96%_0.04_155)] px-4 py-3 text-[13px] text-[oklch(36%_0.13_155)] border border-[oklch(85%_0.08_155)]">
                  <CheckCircle2 size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold">
                      Signed{' '}
                      {note.signedAt
                        ? new Date(note.signedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : ''}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[oklch(40%_0.13_155)]">
                      Locked. Future edits are amendments and tracked in the audit log.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* section nav rail */}
        {note && (
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <h3 className="text-[10px] uppercase tracking-[0.07em] font-semibold text-[oklch(55%_0.012_240)] mb-3">
                Jump to
              </h3>
              <nav className="flex flex-col gap-0.5">
                {note.sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jumpToSection(s.key)}
                    className="text-left text-[12.5px] text-[oklch(40%_0.015_240)] hover:text-[oklch(20%_0.02_240)] hover:bg-[oklch(96%_0.008_240)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)] rounded-md px-2.5 py-1.5 transition-colors"
                  >
                    {s.title}
                    <span className="ml-2 text-[10.5px] text-[oklch(45%_0.012_240)]">
                      {s.sentences.length}
                    </span>
                  </button>
                ))}
              </nav>
              <div className="mt-6 text-[11px] text-[oklch(58%_0.012_240)] leading-[1.55]">
                Click any{' '}
                <span className="text-[oklch(45%_0.16_255)] underline decoration-dotted underline-offset-2">
                  [m:ss]
                </span>{' '}
                citation to jump to its source segment.
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
