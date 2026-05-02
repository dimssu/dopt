import { z } from 'zod';

export const Patient = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  mrn: z.string().min(1).max(64),
  givenName: z.string().min(1).max(100),
  familyName: z.string().min(1).max(100),
  birthDate: z.coerce.date(),
  sex: z.enum(['female', 'male', 'other', 'unknown']),
  pronouns: z.string().max(40).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Patient = z.infer<typeof Patient>;
