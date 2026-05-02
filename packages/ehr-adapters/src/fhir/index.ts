import type { AdapterConfig, EHRAdapter } from '../adapter.js';
import type { Encounter, Note, Patient } from '@clinical-notes/types';

/**
 * FHIR R4 adapter. Canonical mapping. Other vendor adapters delegate here for
 * the spec-compliant pieces and layer their quirks on top.
 */
export class FHIRAdapter implements EHRAdapter {
  readonly kind = 'fhir';

  constructor(private readonly config: AdapterConfig) {}

  patientToVendor(patient: Patient): unknown {
    return {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [{ system: 'urn:clinical-notes:mrn', value: patient.mrn }],
      name: [{ given: [patient.givenName], family: patient.familyName }],
      gender: patient.sex === 'unknown' ? 'unknown' : patient.sex,
      birthDate: patient.birthDate.toISOString().slice(0, 10),
      telecom: [
        ...(patient.contactEmail ? [{ system: 'email', value: patient.contactEmail }] : []),
        ...(patient.contactPhone ? [{ system: 'phone', value: patient.contactPhone }] : []),
      ],
    };
  }

  vendorToPatient(vendor: unknown): Patient {
    const v = vendor as Record<string, unknown> & {
      id?: string;
      identifier?: Array<{ value?: string }>;
      name?: Array<{ given?: string[]; family?: string }>;
      birthDate?: string;
      gender?: string;
      telecom?: Array<{ system?: string; value?: string }>;
    };
    const name = v.name?.[0];
    const email = v.telecom?.find((t) => t.system === 'email')?.value;
    const phone = v.telecom?.find((t) => t.system === 'phone')?.value;
    const sex = (['female', 'male', 'other'] as const).includes(v.gender as 'female' | 'male' | 'other')
      ? (v.gender as 'female' | 'male' | 'other')
      : ('unknown' as const);
    return {
      id: v.id ?? '',
      tenantId: '',
      mrn: v.identifier?.[0]?.value ?? '',
      givenName: name?.given?.[0] ?? '',
      familyName: name?.family ?? '',
      birthDate: new Date(v.birthDate ?? '1970-01-01'),
      sex,
      contactEmail: email,
      contactPhone: phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  encounterToVendor(encounter: Encounter, _patient: Patient): unknown {
    return {
      resourceType: 'Encounter',
      id: encounter.id,
      status: encounter.status === 'in_progress' ? 'in-progress' : encounter.status === 'signed' ? 'finished' : 'planned',
      class: { code: encounter.mode === 'in_person' ? 'AMB' : 'VR' },
      subject: { reference: `Patient/${encounter.patientId}` },
      participant: [{ individual: { reference: `Practitioner/${encounter.clinicianId}` } }],
      period: {
        start: encounter.startedAt?.toISOString(),
        end: encounter.endedAt?.toISOString(),
      },
      reasonCode: encounter.reasonForVisit ? [{ text: encounter.reasonForVisit }] : undefined,
    };
  }

  async pushNote(note: Note, encounter: Encounter, _patient: Patient): Promise<{ vendorId: string }> {
    const text = note.sections
      .map((s) => `## ${s.title}\n\n${s.sentences.map((sn) => sn.text).join(' ')}`)
      .join('\n\n');
    const body = {
      resourceType: 'DocumentReference',
      status: note.status === 'signed' ? 'current' : 'preliminary',
      type: { coding: [{ system: 'http://loinc.org', code: '11506-3', display: 'Progress note' }] },
      subject: { reference: `Patient/${encounter.patientId}` },
      context: { encounter: [{ reference: `Encounter/${encounter.id}` }] },
      content: [
        {
          attachment: {
            contentType: 'text/markdown',
            data: Buffer.from(text, 'utf-8').toString('base64'),
          },
        },
      ],
    };
    const res = await fetch(`${this.config.baseUrl}/DocumentReference`, {
      method: 'POST',
      headers: { 'content-type': 'application/fhir+json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`FHIR push failed: ${res.status}`);
    }
    const json = (await res.json()) as { id?: string };
    return { vendorId: json.id ?? '' };
  }

  async pullRecent(_since: Date): Promise<{ patients: Patient[]; encounters: Encounter[] }> {
    return { patients: [], encounters: [] };
  }
}
