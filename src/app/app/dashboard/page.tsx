'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mic,
  Stethoscope,
  TimerReset,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
} from '@/components/ui';

import { api, type ApiEncounter } from '@/lib/api';

export default function Dashboard() {
  const [encounters, setEncounters] = useState<ApiEncounter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clinicianName, setClinicianName] = useState<string>('');

  const refresh = useCallback(() => {
    try {
      const list = api.listEncounters().data;
      setEncounters(list);
      setClinicianName(list[0]?.clinician?.name?.replace(/^Dr\.\s+/, '') ?? '');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load encounters');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const awaitingReview = useMemo(
    () => (encounters ?? []).filter((e) => e.status === 'awaiting_review'),
    [encounters],
  );
  const signed = useMemo(
    () => (encounters ?? []).filter((e) => e.status === 'signed'),
    [encounters],
  );
  const scheduled = useMemo(
    () => (encounters ?? []).filter((e) => e.status === 'scheduled' || e.status === 'in_progress'),
    [encounters],
  );

  return (
    <div className="px-8 py-8">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.015em]">
            {clinicianName ? `Welcome back, ${clinicianName.split(' ')[0]}.` : 'Welcome back.'}
          </h1>
          <p className="mt-1 text-[13.5px] text-[oklch(45%_0.012_240)]">
            {encounters
              ? `${scheduled.length} on your schedule, ${awaitingReview.length} awaiting your review.`
              : 'Loading your day…'}
          </p>
        </div>
      </header>

      {error && (
        <div className="mt-6 rounded-md border border-[oklch(80%_0.1_25)] bg-[oklch(98%_0.04_25)] px-4 py-3 text-[13px] text-[oklch(40%_0.18_25)]">
          {error}
        </div>
      )}

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          icon={<CalendarClock size={16} strokeWidth={1.75} />}
          tone="accent"
          label="Encounters today"
          value={String((scheduled.length + awaitingReview.length + signed.length) || 0)}
          hint="2 in person · 0 telehealth"
        />
        <Stat
          icon={<ClipboardList size={16} strokeWidth={1.75} />}
          tone="warn"
          label="Awaiting review"
          value={String(awaitingReview.length)}
          hint="Drafts ready for your eyes"
        />
        <Stat
          icon={<CheckCircle2 size={16} strokeWidth={1.75} />}
          tone="ok"
          label="Signed today"
          value={String(signed.length)}
          hint={signed.length === 0 ? 'Nothing signed yet' : 'Locked and audit-stamped'}
        />
        <Stat
          icon={<TimerReset size={16} strokeWidth={1.75} />}
          tone="neutral"
          label="Avg. note time"
          value="42 s"
          hint="from end-of-visit to draft"
        />
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Awaiting review"
          icon={<ClipboardList size={14} strokeWidth={1.75} />}
        />
        {awaitingReview.length === 0 && encounters !== null ? (
          <Card className="mt-3">
            <EmptyState
              title="Nothing to review"
              description="Generated notes that need a clinician's eyes will show up here."
            />
          </Card>
        ) : (
          <Card className="mt-3 divide-y divide-[oklch(94%_0.008_240)]">
            {awaitingReview.map((e) => (
              <EncounterRow key={e.id} encounter={e} action="review" />
            ))}
          </Card>
        )}
      </section>

      {signed.length > 0 && (
        <section className="mt-10">
          <SectionHeader
            title="Signed today"
            icon={<CheckCircle2 size={14} strokeWidth={1.75} />}
          />
          <Card className="mt-3 divide-y divide-[oklch(94%_0.008_240)]">
            {signed.map((e) => (
              <EncounterRow key={e.id} encounter={e} action="review" tone="signed" />
            ))}
          </Card>
        </section>
      )}

      <section className="mt-10 mb-12">
        <SectionHeader
          title="Scheduled"
          icon={<CalendarClock size={14} strokeWidth={1.75} />}
        />
        {scheduled.length === 0 && encounters !== null ? (
          <Card className="mt-3">
            <EmptyState
              title="Nothing scheduled"
              description="When patients are on the calendar they'll appear here, ready to start with one click."
            />
          </Card>
        ) : (
          <Card className="mt-3 divide-y divide-[oklch(94%_0.008_240)]">
            {scheduled.map((e) => (
              <EncounterRow key={e.id} encounter={e} action="capture" />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[oklch(40%_0.015_240)]">
      <span className="text-[oklch(55%_0.012_240)]">{icon}</span>
      {title}
    </h2>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: 'accent' | 'ok' | 'warn' | 'neutral';
}) {
  const toneBg: Record<typeof tone, string> = {
    accent: 'bg-[oklch(96%_0.025_250)] text-[oklch(45%_0.16_255)]',
    ok: 'bg-[oklch(96%_0.04_155)] text-[oklch(40%_0.13_155)]',
    warn: 'bg-[oklch(96%_0.05_70)] text-[oklch(40%_0.13_70)]',
    neutral: 'bg-[oklch(96%_0.008_240)] text-[oklch(40%_0.015_240)]',
  };
  return (
    <Card className="px-5 py-4">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${toneBg[tone]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 text-[24px] font-semibold tracking-[-0.015em] tabular-nums">{value}</div>
      <div className="mt-0.5 text-[12.5px] text-[oklch(45%_0.012_240)]">{label}</div>
      <div className="mt-1 text-[11.5px] text-[oklch(48%_0.012_240)]">{hint}</div>
    </Card>
  );
}

function EncounterRow({
  encounter,
  action,
  tone,
}: {
  encounter: ApiEncounter;
  action: 'review' | 'capture';
  tone?: 'signed';
}) {
  const name = encounter.patient
    ? `${encounter.patient.givenName} ${encounter.patient.familyName}`
    : 'Unknown patient';
  const href = action === 'review' ? `/app/encounter/${encounter.id}/review` : `/app/encounter/${encounter.id}/capture`;
  const Wrapper: React.ElementType = action === 'review' ? Link : 'div';

  return (
    <Wrapper
      {...(action === 'review' ? { href } : {})}
      className={`flex items-center gap-4 px-5 py-3.5 ${action === 'review' ? 'hover:bg-[oklch(98.5%_0.005_240)] cursor-pointer transition-colors' : ''}`}
    >
      <Avatar name={name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[14.5px] font-medium tracking-[-0.005em]">{name}</span>
          {encounter.patient && (
            <span className="text-[11.5px] text-[oklch(58%_0.012_240)] font-mono">
              MRN {encounter.patient.mrn}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[12.5px] text-[oklch(48%_0.012_240)] flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Stethoscope size={11} strokeWidth={1.75} />
            {encounter.reasonForVisit ?? 'Visit'}
          </span>
          {encounter.endedAt && (
            <span className="text-[oklch(58%_0.012_240)]">
              · captured {relativeTime(new Date(encounter.endedAt))}
            </span>
          )}
          {encounter.scheduledAt && action === 'capture' && (
            <span className="text-[oklch(58%_0.012_240)]">
              · {new Date(encounter.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {action === 'review' && (
        <>
          <Badge tone={tone === 'signed' ? 'ok' : 'warn'} className="gap-1">
            {tone === 'signed' ? <CheckCircle2 size={10} strokeWidth={2.25} /> : <FileText size={10} strokeWidth={2.25} />}
            {tone === 'signed' ? 'Signed' : 'SOAP draft'}
          </Badge>
          <ArrowRight size={14} strokeWidth={1.75} className="text-[oklch(60%_0.012_240)] shrink-0" />
        </>
      )}
      {action === 'capture' && (
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-[13px] font-medium rounded-md bg-[oklch(50%_0.14_250)] text-white hover:bg-[oklch(46%_0.15_250)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(50%_0.14_250)] transition-colors"
        >
          <Mic size={13} strokeWidth={2} />
          {encounter.status === 'in_progress' ? 'Resume' : 'Start encounter'}
        </Link>
      )}
    </Wrapper>
  );
}

function relativeTime(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return d.toLocaleDateString();
}
