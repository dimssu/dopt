import { z } from 'zod';
import { TenantTier, DataResidency } from '@clinical-notes/types';

export * from './specialty-templates.js';

export const Branding = z.object({
  name: z.string().min(1).max(200),
  logoUrl: z.string().url().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  faviconUrl: z.string().url().nullable().optional(),
});
export type Branding = z.infer<typeof Branding>;

export const Locale = z.object({
  language: z.string().min(2).max(10).default('en-US'),
  timezone: z.string().default('America/New_York'),
  dateFormat: z.string().default('MMM d, yyyy'),
  measurement: z.enum(['imperial', 'metric']).default('imperial'),
});
export type Locale = z.infer<typeof Locale>;

export const RetentionPolicy = z.object({
  audioDays: z.number().int().min(0).max(3650).default(30),
  transcriptDays: z.number().int().min(0).max(7300).default(2555), // 7y default
  noteDays: z.number().int().min(0).max(7300).default(2555),
  auditDays: z.number().int().min(365).max(7300).default(2555),
});
export type RetentionPolicy = z.infer<typeof RetentionPolicy>;

export const FeatureFlags = z.object({
  ambientCapture: z.boolean().default(true),
  pushToTalk: z.boolean().default(true),
  autoCoding: z.boolean().default(true),
  smartOnFhir: z.boolean().default(false),
  hl7v2: z.boolean().default(false),
  customTemplates: z.boolean().default(true),
  patientPortal: z.boolean().default(false),
});
export type FeatureFlags = z.infer<typeof FeatureFlags>;

export const ProviderRouting = z.object({
  asrPrimary: z.enum(['whisper_local', 'deepgram']).default('whisper_local'),
  asrFallback: z.enum(['whisper_local', 'deepgram', 'none']).default('deepgram'),
  llmProvider: z.enum(['anthropic']).default('anthropic'),
  llmModel: z.string().default('claude-sonnet-4-6'),
});
export type ProviderRouting = z.infer<typeof ProviderRouting>;

export const SignatureBlock = z.object({
  text: z.string().max(2000),
  includeNpi: z.boolean().default(true),
  includeAddress: z.boolean().default(true),
});
export type SignatureBlock = z.infer<typeof SignatureBlock>;

export const TenantConfig = z.object({
  version: z.literal(1).default(1),
  tier: TenantTier,
  dataResidency: DataResidency,
  branding: Branding,
  locale: Locale,
  retention: RetentionPolicy,
  features: FeatureFlags,
  providers: ProviderRouting,
  defaultNoteFormat: z.enum(['soap', 'hp', 'progress', 'discharge', 'referral', 'custom']).default('soap'),
  defaultSpecialty: z.string().default('family_medicine'),
  signatureBlock: SignatureBlock.optional(),
  vocabulary: z.array(z.string()).default([]),
});
export type TenantConfig = z.infer<typeof TenantConfig>;

export function parseTenantConfig(raw: unknown): TenantConfig {
  return TenantConfig.parse(raw);
}
