import Link from 'next/link';
import { Card, Badge, Button, EmptyState } from '@clinical-notes/ui';

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.015em]">Today</h1>
          <p className="text-[14px] text-[oklch(40%_0.015_240)]">
            Tuesday, May 2 — 4 scheduled, 1 awaiting review
          </p>
        </div>
        <Link href="/app/encounter/new">
          <Button>Start an encounter</Button>
        </Link>
      </header>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
          Awaiting review
        </h2>
        <Card className="mt-4 divide-y divide-[oklch(92%_0.008_240)]">
          <Link
            href="/app/encounter/00000000-0000-0000-0000-000000000001/review"
            className="flex items-center justify-between px-5 py-4 hover:bg-[oklch(98%_0.005_240)]"
          >
            <div>
              <div className="text-[15px] font-medium">Avery Bhatt · MRN R-1001</div>
              <div className="mt-0.5 text-[13px] text-[oklch(55%_0.012_240)]">
                Annual wellness · 22 min · captured 18 minutes ago
              </div>
            </div>
            <Badge tone="warn">SOAP draft</Badge>
          </Link>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-[15px] font-semibold uppercase tracking-[0.04em] text-[oklch(40%_0.015_240)]">
          Scheduled
        </h2>
        <Card className="mt-4">
          <EmptyState
            title="No upcoming encounters"
            description="Your schedule will appear here. Connect your calendar in Settings to sync."
            action={
              <Link href="/app/settings/integrations">
                <Button variant="secondary" size="sm">
                  Connect calendar
                </Button>
              </Link>
            }
          />
        </Card>
      </section>
    </div>
  );
}
