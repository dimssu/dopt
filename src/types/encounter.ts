import { z } from 'zod';

export const EncounterStatus = z.enum([
  'scheduled',
  'in_progress',
  'awaiting_review',
  'signed',
  'amended',
  'cancelled',
]);
export type EncounterStatus = z.infer<typeof EncounterStatus>;

export const EncounterMode = z.enum(['in_person', 'telehealth', 'home_visit']);
export type EncounterMode = z.infer<typeof EncounterMode>;

export const Encounter = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  status: EncounterStatus,
  mode: EncounterMode,
  scheduledAt: z.coerce.date().nullable(),
  startedAt: z.coerce.date().nullable(),
  endedAt: z.coerce.date().nullable(),
  reasonForVisit: z.string().max(500).optional(),
  templateId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Encounter = z.infer<typeof Encounter>;
