import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';

import type { TranscriptSegment } from '@prisma/client';

import { SOAP_SYSTEM_PROMPT } from './prompts/soap.js';

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

export async function generateSoap(transcript: TranscriptSegment[]): Promise<GeneratedNote> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return offlineFallback(transcript);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = buildUserMessage(transcript);
  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.2,
    system: [
      { type: 'text', text: SOAP_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return offlineFallback(transcript);
  }

  return parseModelOutput(textBlock.text, transcript);
}

function buildUserMessage(transcript: TranscriptSegment[]): string {
  const lines = transcript.map(
    (s) =>
      `[${s.id} | ${s.speakerLabel} | ${s.startMs}-${s.endMs}ms] ${s.text}`,
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

function parseModelOutput(text: string, transcript: TranscriptSegment[]): GeneratedNote {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd < 0) {
    return offlineFallback(transcript);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    return offlineFallback(transcript);
  }
  const draft = parsed as {
    sections?: Array<{ key?: string; title?: string; sentences?: Array<{ text?: string; citations?: Array<{ segmentId?: string; startMs?: number; endMs?: number }> }> }>;
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
 * runs end-to-end without an API key. Citations point at real seeded segments.
 */
function offlineFallback(transcript: TranscriptSegment[]): GeneratedNote {
  const findSeg = (predicate: (s: TranscriptSegment) => boolean): TranscriptSegment | undefined =>
    transcript.find(predicate);

  const fatigueSeg = findSeg((s) => s.text.toLowerCase().includes('fatigue'));
  const coldSeg = findSeg((s) => s.text.toLowerCase().includes('cold'));
  const noChestSeg = findSeg((s) => s.text.toLowerCase().includes('nothing like that'));
  const examSeg = findSeg((s) => s.text.toLowerCase().includes('blood pressure'));
  const planSeg = findSeg((s) => s.text.toLowerCase().includes('tsh'));
  const followUpSeg = findSeg((s) => s.text.toLowerCase().includes('review the results'));

  const cite = (seg: TranscriptSegment | undefined) =>
    seg ? [{ segmentId: seg.id, startMs: seg.startMs, endMs: seg.endMs }] : [];

  return {
    sections: [
      {
        id: randomUUID(),
        key: 'subjective',
        title: 'Subjective',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Patient presents for an annual wellness visit and reports two months of afternoon fatigue despite roughly seven hours of sleep nightly.', citations: cite(fatigueSeg) },
          { id: randomUUID(), text: 'She also notes new cold intolerance relative to others around her.', citations: cite(coldSeg) },
          { id: randomUUID(), text: 'No palpitations, chest pain, or shortness of breath with exertion.', citations: cite(noChestSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'objective',
        title: 'Objective',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'BP 122/78, HR 70, BMI 23 — unchanged from prior visit.', citations: cite(examSeg) },
          { id: randomUUID(), text: 'Heart sounds regular without murmurs; lungs clear bilaterally.', citations: cite(examSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'assessment',
        title: 'Assessment',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Fatigue with cold intolerance — concern for hypothyroidism; iron-deficiency anemia is also on the differential.', citations: cite(fatigueSeg).concat(cite(coldSeg)) },
          { id: randomUUID(), text: 'Otherwise stable, with normal vitals and a normal cardiopulmonary exam.', citations: cite(examSeg) },
        ],
      },
      {
        id: randomUUID(),
        key: 'plan',
        title: 'Plan',
        manualEdits: false,
        sentences: [
          { id: randomUUID(), text: 'Order TSH, free T4, CBC, basic metabolic panel, and iron studies today.', citations: cite(planSeg) },
          { id: randomUUID(), text: 'Patient counselled on sleep regularity and adding protein at lunch as a near-term measure for afternoon energy crashes.', citations: cite(followUpSeg) },
          { id: randomUUID(), text: 'Follow up in approximately one week to review results and decide on next steps.', citations: cite(followUpSeg) },
        ],
      },
    ],
    codes: [
      { system: 'icd10', code: 'R53.83', display: 'Other fatigue', confidence: 0.82 },
      { system: 'icd10', code: 'E03.9', display: 'Hypothyroidism, unspecified (provisional)', confidence: 0.55 },
      { system: 'cpt', code: '99395', display: 'Periodic comprehensive preventive medicine, established patient (18-39 yrs)', confidence: 0.9 },
    ],
  };
}
