import { z } from 'zod';

export const SpeakerRole = z.enum(['clinician', 'patient', 'caregiver', 'other']);
export type SpeakerRole = z.infer<typeof SpeakerRole>;

export const TranscriptSegment = z.object({
  id: z.string().uuid(),
  encounterId: z.string().uuid(),
  speakerLabel: z.string().min(1).max(64),
  speakerRole: SpeakerRole,
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
  text: z.string(),
  confidence: z.number().min(0).max(1),
  isFinal: z.boolean(),
  createdAt: z.coerce.date(),
});
export type TranscriptSegment = z.infer<typeof TranscriptSegment>;

export const TranscriptSpan = z.object({
  segmentId: z.string().uuid(),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative(),
});
export type TranscriptSpan = z.infer<typeof TranscriptSpan>;
