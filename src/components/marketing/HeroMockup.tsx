import { Sparkles } from 'lucide-react';

/**
 * Marketing hero visual — a CSS rendition of the product's review screen.
 * Static markup, no real data, but designed to look like a product screenshot
 * so the landing page reads as "this exists" instead of "this is being
 * pitched". Rendered server-side for instant first paint.
 */
export function HeroMockup() {
  return (
    <div
      className="relative"
      role="img"
      aria-label="Product preview: a doctor-patient transcript on the left and a citation-linked SOAP note on the right."
    >
      <div className="absolute -inset-6 rounded-[28px] bg-gradient-to-br from-[oklch(95%_0.04_250)] to-[oklch(98%_0.01_240)] -z-10" aria-hidden />
      <div className="rounded-2xl border border-[oklch(90%_0.012_240)] bg-white shadow-[0_24px_64px_-16px_oklch(50%_0.14_250_/_0.18),0_4px_12px_-4px_oklch(0%_0_0_/_0.08)] overflow-hidden">
        {/* window chrome */}
        <div className="h-9 border-b border-[oklch(94%_0.008_240)] bg-[oklch(98.5%_0.005_240)] flex items-center gap-2 px-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(80%_0.05_25)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(80%_0.05_70)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(80%_0.05_155)]" />
          <div className="ml-3 text-[10.5px] text-[oklch(55%_0.012_240)] font-mono">
            clinical-notes / encounter / review
          </div>
        </div>

        {/* page header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[oklch(94%_0.008_240)]">
          <div>
            <div className="text-[13.5px] font-semibold tracking-[-0.01em]">Avery Bhatt</div>
            <div className="text-[10.5px] text-[oklch(55%_0.012_240)] mt-0.5">
              Annual wellness · MRN R-1001
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.06em] font-semibold rounded-full bg-[oklch(96%_0.05_70)] text-[oklch(40%_0.12_70)] px-2 py-0.5">
            SOAP draft
          </span>
        </div>

        {/* two-pane body */}
        <div className="grid grid-cols-2 divide-x divide-[oklch(94%_0.008_240)]">
          {/* transcript */}
          <div className="px-4 py-4 space-y-3.5">
            <div className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[oklch(55%_0.012_240)]">
              Transcript
            </div>
            <Bubble
              who="Dr. Reyes"
              when="0:05"
              role="clinician"
              text="How are you feeling overall since we last met?"
            />
            <Bubble
              who="Avery"
              when="0:08"
              role="patient"
              highlight
              text="I've had this nagging fatigue in the afternoons for two months."
            />
            <Bubble
              who="Dr. Reyes"
              when="0:34"
              role="clinician"
              text="Any palpitations, chest pain, shortness of breath?"
            />
            <Bubble who="Avery" when="0:40" role="patient" text="No, nothing like that." />
          </div>

          {/* note */}
          <div className="px-4 py-4 space-y-4">
            <div className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[oklch(55%_0.012_240)] flex items-center gap-1.5">
              <Sparkles size={10} strokeWidth={2.25} className="text-[oklch(50%_0.14_250)]" />
              SOAP note · generated
            </div>
            <Section
              title="Subjective"
              sentences={[
                {
                  text: 'Patient presents for an annual wellness visit and reports two months of afternoon fatigue.',
                  cites: ['0:05', '0:08'],
                  highlight: true,
                },
                {
                  text: 'Cardiopulmonary review of systems negative for chest pain or dyspnea.',
                  cites: ['0:34', '0:40'],
                },
              ]}
            />
            <Section
              title="Plan"
              sentences={[
                {
                  text: 'Order TSH, free T4, CBC, basic metabolic panel, and iron studies.',
                  cites: ['1:08'],
                },
              ]}
            />
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.06em] font-semibold rounded bg-[oklch(96%_0.04_155)] text-[oklch(38%_0.12_155)] px-1.5 py-0.5">
                ICD R53.83 · 82%
              </span>
              <span className="text-[9px] uppercase tracking-[0.06em] font-semibold rounded bg-[oklch(96%_0.04_155)] text-[oklch(38%_0.12_155)] px-1.5 py-0.5">
                CPT 99395 · 90%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* floating annotation */}
      <div className="absolute -right-3 top-32 hidden lg:flex items-center gap-2 rounded-full bg-[oklch(20%_0.02_240)] text-white text-[10.5px] px-2.5 py-1.5 shadow-lg">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(75%_0.16_155)]" />
        Click any citation to verify
      </div>
    </div>
  );
}

function Bubble({
  who,
  when,
  role,
  text,
  highlight,
}: {
  who: string;
  when: string;
  role: 'clinician' | 'patient';
  text: string;
  highlight?: boolean;
}) {
  const stripe = role === 'clinician' ? 'border-[oklch(50%_0.14_250)]' : 'border-[oklch(60%_0.12_155)]';
  return (
    <div className={`border-l-2 pl-3 ${stripe} ${highlight ? 'bg-[oklch(96%_0.02_250)] -mx-2 rounded-r px-3' : ''}`}>
      <div className="text-[9.5px] uppercase tracking-[0.06em] text-[oklch(55%_0.012_240)] flex items-center gap-1.5">
        <span className="font-semibold text-[oklch(35%_0.015_240)]">{who}</span>
        <span aria-hidden>·</span>
        <span>{when}</span>
      </div>
      <div className="mt-0.5 text-[12px] leading-[1.45] text-[oklch(22%_0.02_240)]">{text}</div>
    </div>
  );
}

function Section({
  title,
  sentences,
}: {
  title: string;
  sentences: Array<{ text: string; cites: string[]; highlight?: boolean }>;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.06em] font-semibold text-[oklch(40%_0.015_240)]">
        {title}
      </div>
      <p className="mt-1.5 text-[12px] leading-[1.55] text-[oklch(20%_0.02_240)]">
        {sentences.map((s, i) => (
          <span key={i} className={s.highlight ? 'bg-[oklch(96%_0.05_70)] -mx-0.5 px-0.5 rounded' : ''}>
            {s.text}{' '}
            {s.cites.map((c, j) => (
              <span
                key={j}
                className="inline-flex items-baseline rounded-sm px-1 -mx-1 text-[oklch(45%_0.16_255)] underline decoration-dotted underline-offset-2 text-[10.5px]"
              >
                [{c}]
              </span>
            ))}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}
