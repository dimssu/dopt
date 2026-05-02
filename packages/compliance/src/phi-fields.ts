/**
 * Canonical registry of PHI-bearing fields. Any model field that may contain
 * PHI must be enumerated here. CI runs `tools/phi-scanner` to ensure every
 * such field is encrypted at rest, redacted in logs, and audited on access.
 *
 * Owned by: compliance-officer.
 */
export const PHI_FIELDS = {
  Patient: ['mrn', 'givenName', 'familyName', 'birthDate', 'contactEmail', 'contactPhone'],
  Encounter: ['reasonForVisit'],
  TranscriptSegment: ['text'],
  Note: ['sections'],
  AuditEvent: ['metadata.payload'],
} as const satisfies Record<string, readonly string[]>;

export type PHIModel = keyof typeof PHI_FIELDS;

export function isPHIField(model: string, field: string): boolean {
  const fields = (PHI_FIELDS as Record<string, readonly string[]>)[model];
  return fields ? fields.includes(field) : false;
}
