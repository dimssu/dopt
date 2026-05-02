import Link from 'next/link';
import { Card, Badge } from '@clinical-notes/ui';

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.015em]">Riverside Family Practice</h1>
          <p className="text-[14px] text-[oklch(40%_0.015_240)]">
            Tenant administration · US data residency · Practice tier
          </p>
        </div>
        <Badge tone="ok">All systems normal</Badge>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/branding">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Branding</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              Logo, colors, signature blocks, marketing surfaces.
            </p>
          </Card>
        </Link>
        <Link href="/templates">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Note templates</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              Specialty defaults and per-clinician overrides.
            </p>
          </Card>
        </Link>
        <Link href="/users">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Users &amp; roles</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              Clinicians, scribe reviewers, billing, auditors.
            </p>
          </Card>
        </Link>
        <Link href="/integrations">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Integrations</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              FHIR, HL7v2, EHR connectors, webhooks.
            </p>
          </Card>
        </Link>
        <Link href="/compliance">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Compliance</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              Retention, residency, BAA documents, audit log.
            </p>
          </Card>
        </Link>
        <Link href="/billing">
          <Card className="p-6 hover:border-[oklch(70%_0.015_240)]">
            <h3 className="text-[15px] font-semibold">Billing</h3>
            <p className="mt-1 text-[14px] text-[oklch(40%_0.015_240)]">
              Plan, usage, invoices.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
