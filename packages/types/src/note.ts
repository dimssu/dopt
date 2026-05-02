import { z } from 'zod';
import { TranscriptSpan } from './transcript.js';

export const NoteFormat = z.enum(['soap', 'hp', 'progress', 'discharge', 'referral', 'custom']);
export type NoteFormat = z.infer<typeof NoteFormat>;

export const NoteStatus = z.enum(['draft', 'awaiting_review', 'signed', 'amended']);
export type NoteStatus = z.infer<typeof NoteStatus>;

export const NoteSentence = z.object({
  id: z.string().uuid(),
  text: z.string(),
  citations: z.array(TranscriptSpan).min(1),
});
export type NoteSentence = z.infer<typeof NoteSentence>;

export const NoteSection = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  sentences: z.array(NoteSentence),
  manualEdits: z.boolean().default(false),
});
export type NoteSection = z.infer<typeof NoteSection>;

export const CodeSuggestion = z.object({
  system: z.enum(['icd10', 'cpt', 'snomed', 'rxnorm']),
  code: z.string().min(1),
  display: z.string().min(1),
  confidence: z.number().min(0).max(1),
});
export type CodeSuggestion = z.infer<typeof CodeSuggestion>;

export const Note = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  encounterId: z.string().uuid(),
  format: NoteFormat,
  status: NoteStatus,
  templateId: z.string().uuid().nullable(),
  sections: z.array(NoteSection),
  codes: z.array(CodeSuggestion),
  signedBy: z.string().uuid().nullable(),
  signedAt: z.coerce.date().nullable(),
  generatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Note = z.infer<typeof Note>;
