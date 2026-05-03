import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileSignature,
  Lock,
  Mic,
  Quote,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

import { Badge, Button, Card, Logo } from '@/components/ui';
import { HeroMockup } from '@/components/marketing/HeroMockup';

export default function MarketingHome() {
  return (
    <main className="min-h-dvh bg-[oklch(98.5%_0.005_240)]">
      <div className="absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,oklch(95%_0.06_250)_0%,transparent_70%)]" />

      <header className="mx-auto max-w-6xl px-6 pt-7 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[oklch(20%_0.02_240)]">
          <Logo className="h-6 w-6 text-[oklch(50%_0.14_250)]" />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Clinical Notes</span>
        </Link>
        <nav className="flex items-center gap-7 text-[14px] text-[oklch(40%_0.015_240)]">
          <Link href="#product" className="hover:text-[oklch(20%_0.02_240)] transition-colors">
            Product
          </Link>
          <Link href="#integrations" className="hover:text-[oklch(20%_0.02_240)] transition-colors">
            Integrations
          </Link>
          <Link href="#compliance" className="hover:text-[oklch(20%_0.02_240)] transition-colors">
            Compliance
          </Link>
          <Link href="/app/dashboard">
            <Button size="sm">
              Try the demo
              <ArrowRight size={14} strokeWidth={2} />
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-12 lg:gap-16 items-center">
        <div>
          <Badge tone="accent" className="gap-1.5">
            <Sparkles size={11} strokeWidth={2.25} />
            Now in private beta
          </Badge>
          <h1 className="mt-6 text-[44px] leading-[1.05] tracking-[-0.025em] font-semibold text-[oklch(18%_0.02_240)]">
            Clinical documentation
            <br />
            that writes itself,
            <br />
            <span className="text-[oklch(45%_0.16_255)]">in the room.</span>
          </h1>
          <p className="mt-6 text-[17px] leading-[1.55] text-[oklch(40%_0.015_240)] max-w-[36ch]">
            Capture the visit. Get a structured note before the patient leaves. Every sentence cited
            to the conversation, every code suggested with its confidence.
          </p>
          <div className="mt-9 flex items-center gap-3">
            <Link href="/app/dashboard">
              <Button size="lg">
                Try the demo
                <ArrowRight size={16} strokeWidth={2} />
              </Button>
            </Link>
            <Link href="#product">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-y-2.5 text-[13px] text-[oklch(40%_0.015_240)] max-w-md">
            {[
              'Citation-linked SOAP notes',
              'Multi-specialty templates',
              'FHIR R4 round-trip',
              'BAA-ready architecture',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={14} strokeWidth={2.25} className="text-[oklch(55%_0.13_155)]" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <HeroMockup />
      </section>

      <section id="product" className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <div className="max-w-2xl">
          <p className="text-[12px] uppercase tracking-[0.08em] text-[oklch(45%_0.13_250)] font-semibold">
            What it does
          </p>
          <h2 className="mt-3 text-[32px] leading-[1.1] tracking-[-0.02em] font-semibold">
            Three minutes of work, automated.
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<Mic size={18} strokeWidth={1.75} />}
            title="Capture"
            body="Push-to-talk or ambient mode. Speaker-diarized transcript with medical vocabulary tuned for your specialty. Resilient to bad WiFi."
          />
          <FeatureCard
            icon={<Quote size={18} strokeWidth={1.75} />}
            title="Generate"
            body="SOAP, H&P, progress, discharge, referral, or your own template. Every sentence in the note links back to the moment in the conversation that supports it."
          />
          <FeatureCard
            icon={<FileSignature size={18} strokeWidth={1.75} />}
            title="Send"
            body="Round-trip with FHIR R4 or HL7v2. Pre-built adapters for Epic, Cerner, athenahealth, DrChrono. SMART-on-FHIR launch from inside your EHR session."
          />
        </div>
      </section>

      <section id="compliance" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 items-start">
          <div>
            <p className="text-[12px] uppercase tracking-[0.08em] text-[oklch(45%_0.13_250)] font-semibold">
              Compliance
            </p>
            <h2 className="mt-3 text-[32px] leading-[1.1] tracking-[-0.02em] font-semibold">
              Compliance is the floor.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[oklch(40%_0.015_240)] max-w-[44ch]">
              HIPAA-ready architecture, BAA-friendly. End-to-end encryption. Hash-chained audit
              trail. Per-tenant data residency in the US, EU, UK, Canada, or Australia. Your PHI
              never crosses the border you set.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ComplianceRow
              icon={<ShieldCheck size={16} strokeWidth={1.75} />}
              tag="HIPAA"
              copy="BAA on request, signed by counsel."
            />
            <ComplianceRow
              icon={<Lock size={16} strokeWidth={1.75} />}
              tag="SOC 2"
              copy="Type II in progress."
            />
            <ComplianceRow
              icon={<ShieldCheck size={16} strokeWidth={1.75} />}
              tag="GDPR"
              copy="EU residency, DPA available."
            />
            <ComplianceRow
              icon={<Stethoscope size={16} strokeWidth={1.75} />}
              tag="Audit"
              copy="Tamper-evident export, scoped per role."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-[oklch(92%_0.008_240)] mt-12">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-[oklch(45%_0.012_240)]">
          <div className="flex items-center gap-2 text-[oklch(40%_0.015_240)]">
            <Logo className="h-5 w-5 text-[oklch(50%_0.14_250)]" />
            <span>© 2026 Clinical Notes</span>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-[oklch(20%_0.02_240)]">
              Privacy
            </Link>
            <Link href="#" className="hover:text-[oklch(20%_0.02_240)]">
              Terms
            </Link>
            <Link href="#" className="hover:text-[oklch(20%_0.02_240)]">
              BAA
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Card className="p-6 group transition-all duration-200 hover:border-[oklch(80%_0.02_250)] hover:shadow-[0_4px_16px_-4px_oklch(50%_0.14_250_/_0.08)]">
      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[oklch(96%_0.025_250)] text-[oklch(45%_0.16_255)]">
        {icon}
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.005em]">{title}</h3>
      <p className="mt-2 text-[14px] leading-[1.55] text-[oklch(40%_0.015_240)]">{body}</p>
    </Card>
  );
}

function ComplianceRow({
  icon,
  tag,
  copy,
}: {
  icon: React.ReactNode;
  tag: string;
  copy: string;
}) {
  return (
    <Card className="px-5 py-4 flex items-center gap-4">
      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[oklch(96%_0.04_155)] text-[oklch(40%_0.13_155)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold tracking-[-0.005em]">{tag}</div>
        <div className="text-[13px] text-[oklch(45%_0.012_240)] mt-0.5">{copy}</div>
      </div>
    </Card>
  );
}
