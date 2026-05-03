import { z } from 'zod';

export const TenantTier = z.enum(['starter', 'practice', 'clinic', 'enterprise']);
export type TenantTier = z.infer<typeof TenantTier>;

export const DataResidency = z.enum(['us', 'eu', 'ca', 'au', 'uk']);
export type DataResidency = z.infer<typeof DataResidency>;

export const Tenant = z.object({
  id: z.string().uuid(),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  tier: TenantTier,
  dataResidency: DataResidency,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Tenant = z.infer<typeof Tenant>;
