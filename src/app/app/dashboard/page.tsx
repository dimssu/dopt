'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, EmptyState } from '@/components/ui';

import { api, type ApiEncounter } from '@/lib/api';

export default function Dashboard() {
  const [encounters, setEncounters] = useState<ApiEncounter[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setEncounters(api.listEncounters().data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load encounters');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function resetDemo() {
    api.reset();
    refresh();
  }

  const awaitingReview = (encounters ?? []).filter(
    (e) => e.status === 'awaiting_review' || e.status === 'signed',
  );
  const scheduled = (encounters ?? []).filter(
    (e) => e.status === 'scheduled' || e.status === 'in_progress',
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.015em]">Today</h1>
          <p className="text-[14px] text-[oklch(40%_0.015_240)]">
            {encounters
              ? `${scheduled.length} scheduled · ${awaitingReview.length} awaiting review`
              : 'Loading…'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={resetDemo}>
          Reset demo
        </Button>
      </header>

      {error && (
        <div className="mt-6 rounded-md border border-[oklch(80%_0.1_25)] bg-[oklch(98%_0.04_25)] px-4 py-3 text-[13px] text-[oklch(40%_0.18_25)]">
          {error}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
          Awaiting review
        </h2>
        {awaitingReview.length === 0 && encounters !== null ? (
          <Card className="mt-4">
            <EmptyState
              title="Nothing to review"
              description="Generated notes that need a clinician's eyes will show up here."
            />
          </Card>
        ) : (
          <Card className="mt-4 divide-y divide-[oklch(92%_0.008_240)]">
            {awaitingReview.map((e) => (
              <Link
                key={e.id}
                href={`/app/encounter/${e.id}/review`}
                className="flex items-center justify-between px-5 py-4 hover:bg-[oklch(98%_0.005_240)]"
              >
                <div>
                  <div className="text-[15px] font-medium">
                    {e.patient ? `${e.patient.givenName} ${e.patient.familyName}` : '—'}
                    {e.patient ? ` · MRN ${e.patient.mrn}` : ''}
                  </div>
                  <div className="mt-0.5 text-[13px] text-[oklch(55%_0.012_240)]">
                    {e.reasonForVisit ?? 'Visit'}
                    {e.endedAt ? ` · captured ${relativeTime(new Date(e.endedAt))}` : ''}
                  </div>
                </div>
                <Badge tone={e.status === 'signed' ? 'ok' : 'warn'}>
                  {e.status === 'signed' ? 'Signed' : 'SOAP draft'}
                </Badge>
              </Link>
            ))}
          </Card>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
          Scheduled
        </h2>
        {scheduled.length === 0 && encounters !== null ? (
          <Card className="mt-4">
            <EmptyState
              title="Nothing scheduled"
              description="When patients are on the calendar they'll appear here, ready to start with one click."
            />
          </Card>
        ) : (
          <Card className="mt-4 divide-y divide-[oklch(92%_0.008_240)]">
            {scheduled.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-[15px] font-medium">
                    {e.patient ? `${e.patient.givenName} ${e.patient.familyName}` : '—'}
                    {e.patient ? ` · MRN ${e.patient.mrn}` : ''}
                  </div>
                  <div className="mt-0.5 text-[13px] text-[oklch(55%_0.012_240)]">
                    {e.reasonForVisit ?? 'Visit'}
                    {e.scheduledAt
                      ? ` · ${new Date(e.scheduledAt).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`
                      : ''}
                  </div>
                </div>
                <Link href={`/app/encounter/${e.id}/capture`}>
                  <Button size="sm">
                    {e.status === 'in_progress' ? 'Resume' : 'Start encounter'}
                  </Button>
                </Link>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
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
