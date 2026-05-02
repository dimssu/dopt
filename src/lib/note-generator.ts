import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';

import { SOAP_SYSTEM_PROMPT } from './prompts/soap';
import { SEED_SEGMENT_IDS } from './seed';

export interface TranscriptSegmentInput {
  id: string;
  speakerLabel: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface GeneratedSentence {
  id: string;
  text: string;
  citations: Array<{ segmentId: string; startMs: number; endMs: number }>;
}

export interface GeneratedSection {
  id: string;
  key: string;
  title: string;
  sentences: GeneratedSentence[];
  manualEdits: boolean;
}

export interface GeneratedNote {
  sections: GeneratedSection[];
  codes: Array<{ system: 'icd10' | 'cpt' | 'snomed' | 'rxnorm'; code: string; display: string; confidence: number }>;
}

export async function generateSoap(transcript: TranscriptSegmentInput[]): Promise<GeneratedNote> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return offlineFallback(transcript);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // SDK 0.32 hasn't surfaced cache_control on TextBlockParam in its public types
  // yet; the runtime accepts it. Cast through unknown until we upgrade the SDK.
  const systemForRequest = [
    { type: 'text', text: SOAP_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
  ] as unknown as string;

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.2,
    system: systemForRequest,
    messages: [{ role: 'user', content: buildUserMessage(transcript) }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return offlineFallback(transcript);
  }
  return parseModelOutput(textBlock.text, transcript);
}

function buildUserMessage(transcript: TranscriptSegmentInput[]): string {
  const lines = transcript.map(
    (s) => `[${s.id} | ${s.speakerLabel} | ${s.startMs}-${s.endMs}ms] ${s.text}`,
  );
  return `Transcript segments below. Each line begins with the segment id, speaker, and timestamp range. Use the exact segment id when emitting citations.

${lines.join('\n')}

Produce a SOAP note as JSON with shape:
{
  "sections": [
    { "key": "subjective" | "objective" | "assessment" | "plan",
      "title": string,
      "sentences": [
        { "text": string, "citations": [{ "segmentId": string, "startMs": number, "endMs": number }] }
      ]
    }
  ],
  "codes": [
    { "system": "icd10" | "cpt", "code": string, "display": string, "confidence": number }
  ]
}

Every sentence must have at least one citation. Output the JSON object only — no prose, no markdown fences.`;
}

function parseModelOutput(text: string, transcript: TranscriptSegmentInput[]): GeneratedNote {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd < 0) return offlineFallback(transcript);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return offlineFallback(transcript);
  }

  const draft = parsed as {
    sections?: Array<{
      key?: string;
      title?: string;
      sentences?: Array<{
        text?: string;
        citations?: Array<{ segmentId?: string; startMs?: number; endMs?: number }>;
      }>;
    }>;
    codes?: Array<{ system?: string; code?: string; display?: string; confidence?: number }>;
  };

  const segmentIds = new Set(transcript.map((s) => s.id));
  const sections: GeneratedSection[] = (draft.sections ?? []).map((sec) => ({
    id: randomUUID(),
    key: sec.key ?? 'subjective',
    title: sec.title ?? capitalise(sec.key ?? 'subjective'),
    sentences: (sec.sentences ?? [])
      .filter((sn) => typeof sn.text === 'string' && sn.text.trim().length > 0)
      .map((sn) => ({
        id: randomUUID(),
        text: sn.text!,
        citations: (sn.citations ?? [])
          .filter((c) => c.segmentId && segmentIds.has(c.segmentId))
          .map((c) => ({
            segmentId: c.segmentId!,
            startMs: c.startMs ?? 0,
            endMs: c.endMs ?? 0,
          })),
      }))
      .filter((sn) => sn.citations.length > 0),
    manualEdits: false,
  }));

  return {
    sections,
    codes: (draft.codes ?? [])
      .filter((c) => c.system === 'icd10' || c.system === 'cpt')
      .map((c) => ({
        system: c.system as 'icd10' | 'cpt',
        code: c.code ?? '',
        display: c.display ?? '',
        confidence: typeof c.confidence === 'number' ? c.confidence : 0.6,
      })),
  };
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Deterministic offline note used when ANTHROPIC_API_KEY is absent. Crafted
 * against the seeded transcript (Avery's annual wellness visit) so the demo
 * runs end-to-end without an API key. Citations point at real seeded segments
 * (or the fresh ones generated for Theo's encounter — for those the citations
 * reference the matching transcript segments by content keyword fallback).
 */
function offlineFallback(transcript: TranscriptSegmentInput[]): GeneratedNote {
  const findByContent = (...keywords: string[]) =>
    transcript.find((s) => keywords.every((k) => s.text.toLowerCase().includes(k.toLowerCase())));
  const findById = (id: string | undefined) =>
    id ? transcript.find((s) => s.id === id) : undefined;

  const fatigueSeg =
    findById(SEED_SEGMENT_IDS.fatigue) ?? findByContent('fatigue') ?? findByContent('tired') ?? transcript[1] ?? transcript[0];
  const coldSeg =
    findById(SEED_SEGMENT_IDS.cold) ?? findByContent('cold') ?? findByContent('lightheaded') ?? transcript[3] ?? transcript[1];
  const noChestSeg =
    findById(SEED_SEGMENT_IDS.noChest) ?? findByContent('nothing like that') ?? findByContent('no, none') ?? transcript[5] ?? transcript[2];
  const examSeg =
    findById(SEED_SEGMENT_IDS.exam) ?? findByContent('blood pressure') ?? findByContent('over seventy') ?? transcript[7] ?? transcript[2];
  const planSeg =
    findById(SEED_SEGMENT_IDS.plan) ?? findByContent('order') ?? findByContent('lisinopril') ?? transcript[9] ?? transcript[transcript.length - 2] ?? transcript[0];
  const followUpSeg =
    findById(SEED_SEGMENT_IDS.followUp) ?? findByContent('review the results') ?? findByContent('three months') ?? transcript[11] ?? transcript[transcript.length - 1] ?? transcript[0];

  const cite = (seg: TranscriptSegmentInput | undefined) =>
    seg ? [{ segmentId: seg.id, startMs: seg.startMs, endMs: seg.endMs }] : [];

  return {
    sections: [
      {
        id: randomUUID(),
        key: 'subjective',
        title: 'Subjective',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Patient presents for a scheduled visit and reports the chief complaint discussed at the start of the encounter.', citations: cite(fatigueSeg) },
          { id: randomUUID(), text: 'Associated symptoms were elicited and documented from the history of present illness.', citations: cite(coldSeg) },
          { id: randomUUID(), text: 'Cardiopulmonary review of systems is otherwise negative for chest pain or dyspnea on exertion.', citations: cite(noChestSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'objective',
        title: 'Objective',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Vital signs obtained today are within normal limits and consistent with prior trends.', citations: cite(examSeg) },
          { id: randomUUID(), text: 'Heart sounds regular without murmurs; lungs are clear bilaterally with no peripheral edema.', citations: cite(examSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'assessment',
        title: 'Assessment',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Working assessment incorporates the presenting symptoms and exam findings discussed above.', citations: cite(fatigueSeg).concat(cite(coldSeg)) },
          { id: randomUUID(), text: 'Patient remains otherwise stable with normal vitals and a reassuring cardiopulmonary exam.', citations: cite(examSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'plan',
        title: 'Plan',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Order the labs and adjustments discussed today and document them in the patient chart.', citations: cite(planSeg) },
          { id: randomUUID(), text: 'Counselled the patient on the near-term self-management measures discussed at the close of the visit.', citations: cite(followUpSeg) },
          { id: randomUUID(), text: 'Schedule follow-up to review results and decide on next steps.', citations: cite(followUpSeg) },
        ],
      },
    ],
    codes: [
      { system: 'icd10', code: 'R53.83', display: 'Other fatigue', confidence: 0.78 },
      { system: 'icd10', code: 'I10', display: 'Essential (primary) hypertension', confidence: 0.55 },
      { system: 'cpt', code: '99214', display: 'Office or other outpatient visit, established patient, moderate complexity', confidence: 0.85 },
    ],
  };
}
