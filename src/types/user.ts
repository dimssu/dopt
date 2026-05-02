import { z } from 'zod';

export const Role = z.enum(['admin', 'clinician', 'scribe_reviewer', 'billing', 'auditor']);
export type Role = z.infer<typeof Role>;

export const User = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  roles: z.array(Role).min(1),
  npi: z.string().regex(/^\d{10}$/).optional(),
  specialty: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  disabledAt: z.coerce.date().nullable().optional(),
});
export type User = z.infer<typeof User>;
