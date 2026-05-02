import Link from 'next/link';
import { Button, Card, Badge } from '@clinical-notes/ui';

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-[oklch(50%_0.14_250)]" aria-hidden />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Clinical Notes</span>
        </div>
        <nav className="flex items-center gap-6 text-[14px] text-[oklch(40%_0.015_240)]">
          <Link href="#product">Product</Link>
          <Link href="#integrations">Integrations</Link>
          <Link href="#compliance">Compliance</Link>
          <Link href="/app/dashboard">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mt-24 max-w-3xl">
        <Badge tone="accent">Now in private beta</Badge>
        <h1 className="mt-6 text-[44px] font-semibold leading-[1.05] tracking-[-0.025em] text-[oklch(20%_0.02_240)]">
          Clinical documentation that writes itself, in the room.
        </h1>
        <p className="mt-6 text-[18px] leading-[1.5] text-[oklch(40%_0.015_240)]">
          Capture the visit. Get a structured note before the patient leaves. Every sentence cited
          to the conversation, every code suggested with its confidence. Built for any specialty,
          configurable for any practice, ready to round-trip with your EHR.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Link href="/app/dashboard">
            <Button size="lg">Try the demo</Button>
          </Link>
          <Link href="#product">
            <Button variant="secondary" size="lg">
              See how it works
            </Button>
          </Link>
        </div>
      </section>

      <section id="product" className="mt-32 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold">Capture</h3>
          <p className="mt-2 text-[14px] leading-[1.55] text-[oklch(40%_0.015_240)]">
            Push-to-talk or ambient mode. Speaker-diarized transcript with medical vocabulary
            tuned for your specialty. Resilient to bad WiFi, with offline buffering.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold">Generate</h3>
          <p className="mt-2 text-[14px] leading-[1.55] text-[oklch(40%_0.015_240)]">
            SOAP, H&amp;P, progress, discharge, referral, or your own template. Every sentence in
            the note links back to the moment in the conversation that supports it.
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold">Send</h3>
          <p className="mt-2 text-[14px] leading-[1.55] text-[oklch(40%_0.015_240)]">
            Round-trip with FHIR R4 or HL7v2. Pre-built adapters for Epic, Cerner, athenahealth,
            DrChrono. SMART-on-FHIR launch from inside your EHR session.
          </p>
        </Card>
      </section>

      <section id="compliance" className="mt-32 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.015em]">Compliance is the floor.</h2>
          <p className="mt-4 text-[16px] leading-[1.55] text-[oklch(40%_0.015_240)]">
            HIPAA-ready architecture, BAA-friendly. End-to-end encryption. Hash-chained audit
            trail. Per-tenant data residency in the US, EU, UK, Canada, or Australia. Your PHI
            never crosses the border you set.
          </p>
        </div>
        <Card className="p-6">
          <ul className="space-y-3 text-[14px]">
            <li className="flex items-start gap-3">
              <Badge tone="ok">HIPAA</Badge>
              <span className="text-[oklch(40%_0.015_240)]">BAA on request, signed by counsel.</span>
            </li>
            <li className="flex items-start gap-3">
              <Badge tone="ok">SOC 2</Badge>
              <span className="text-[oklch(40%_0.015_240)]">Type II in progress.</span>
            </li>
            <li className="flex items-start gap-3">
              <Badge tone="ok">GDPR</Badge>
              <span className="text-[oklch(40%_0.015_240)]">EU residency, DPA available.</span>
            </li>
            <li className="flex items-start gap-3">
              <Badge tone="neutral">Audit</Badge>
              <span className="text-[oklch(40%_0.015_240)]">Tamper-evident export, scoped per role.</span>
            </li>
          </ul>
        </Card>
      </section>

      <footer className="mt-32 border-t border-[oklch(92%_0.008_240)] pt-8 text-[13px] text-[oklch(55%_0.012_240)]">
        <div className="flex items-center justify-between">
          <span>© 2026 Clinical Notes</span>
          <div className="flex gap-4">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/baa">BAA</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
