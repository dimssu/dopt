import type { Encounter, Note, Patient } from '@clinical-notes/types';

export interface EHRAdapter {
  readonly kind: string;

  /** Map a local Patient → vendor patient object. */
  patientToVendor(patient: Patient): unknown;
  vendorToPatient(vendor: unknown): Patient;

  /** Map a local Encounter → vendor visit/encounter object. */
  encounterToVendor(encounter: Encounter, patient: Patient): unknown;

  /** Push a signed Note to the vendor system. Returns the vendor identifier. */
  pushNote(note: Note, encounter: Encounter, patient: Patient): Promise<{ vendorId: string }>;

  /** Pull recent encounters / patients for a tenant. */
  pullRecent(since: Date): Promise<{ patients: Patient[]; encounters: Encounter[] }>;
}

export interface AdapterConfig {
  baseUrl: string;
  auth: {
    kind: 'oauth_client_credentials' | 'oauth_smart' | 'mtls' | 'api_key';
    [k: string]: unknown;
  };
  options?: Record<string, unknown>;
}
