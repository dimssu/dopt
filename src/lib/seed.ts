/**
 * Seed fixture for the demo. Mirrors the data the production Prisma seeder
 * created — Riverside Family Practice, one clinician, three patients, two
 * encounters, and a 14-segment transcript on the awaiting-review encounter.
 *
 * Deterministic UUIDs so the demo URLs are stable across resets and shared
 * links work after the user clicks "Reset demo".
 */

export const TENANT_ID = '11111111-1111-1111-1111-111111111111';
export const CLINICIAN_ID = '22222222-2222-2222-2222-222222222222';
export const PATIENT_AVERY = '33333333-3333-3333-3333-333333333301';
export const PATIENT_THEO = '33333333-3333-3333-3333-333333333302';
export const PATIENT_SAM = '33333333-3333-3333-3333-333333333303';
export const ENCOUNTER_AVERY = '44444444-4444-4444-4444-444444444401';
export const ENCOUNTER_THEO_SCHEDULED = '44444444-4444-4444-4444-444444444402';

// Stable ids for seeded transcript segments. The offline note generator
// references these so the citation links always resolve.
const SEG_AVERY: string[] = [
  '55555555-5555-5555-5555-555555555501',
  '55555555-5555-5555-5555-555555555502',
  '55555555-5555-5555-5555-555555555503',
  '55555555-5555-5555-5555-555555555504',
  '55555555-5555-5555-5555-555555555505',
  '55555555-5555-5555-5555-555555555506',
  '55555555-5555-5555-5555-555555555507',
  '55555555-5555-5555-5555-555555555508',
  '55555555-5555-5555-5555-555555555509',
  '55555555-5555-5555-5555-55555555550a',
  '55555555-5555-5555-5555-55555555550b',
  '55555555-5555-5555-5555-55555555550c',
  '55555555-5555-5555-5555-55555555550d',
  '55555555-5555-5555-5555-55555555550e',
];

export interface DemoTenant {
  id: string;
  slug: string;
  name: string;
  tier: 'starter' | 'practice' | 'clinic' | 'enterprise';
  dataResidency: 'us' | 'eu' | 'ca' | 'au' | 'uk';
}

export interface DemoUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  roles: Array<'admin' | 'clinician' | 'scribe_reviewer' | 'billing' | 'auditor'>;
  specialty: string | null;
  npi?: string;
}

export interface DemoPatient {
  id: string;
  tenantId: string;
  mrn: string;
  givenName: string;
  familyName: string;
  birthDate: string; // ISO
  sex: 'female' | 'male' | 'other' | 'unknown';
}

export interface DemoEncounter {
  id: string;
  tenantId: string;
  patientId: string;
  clinicianId: string;
  status: 'scheduled' | 'in_progress' | 'awaiting_review' | 'signed' | 'amended' | 'cancelled';
  mode: 'in_person' | 'telehealth' | 'home_visit';
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  reasonForVisit: string | null;
}

export interface DemoTranscriptSegment {
  id: string;
  tenantId: string;
  encounterId: string;
  speakerLabel: string;
  speakerRole: 'clinician' | 'patient' | 'caregiver' | 'other';
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface DemoNoteSentence {
  id: string;
  text: string;
  citations: Array<{ segmentId: string; startMs: number; endMs: number }>;
}

export interface DemoNoteSection {
  id: string;
  key: string;
  title: string;
  sentences: DemoNoteSentence[];
  manualEdits: boolean;
}

export interface DemoCodeSuggestion {
  system: 'icd10' | 'cpt' | 'snomed' | 'rxnorm';
  code: string;
  display: string;
  confidence: number;
}

export interface DemoNote {
  id: string;
  tenantId: string;
  encounterId: string;
  format: 'soap' | 'hp' | 'progress' | 'discharge' | 'referral' | 'custom';
  status: 'draft' | 'awaiting_review' | 'signed' | 'amended';
  templateId: string | null;
  sections: DemoNoteSection[];
  codes: DemoCodeSuggestion[];
  signedById: string | null;
  signedAt: string | null;
  generatedAt: string;
}

export interface DemoState {
  version: 1;
  tenant: DemoTenant;
  clinician: DemoUser;
  patients: DemoPatient[];
  encounters: DemoEncounter[];
  transcripts: DemoTranscriptSegment[];
  notes: DemoNote[];
}

const RAW_TRANSCRIPT: Array<Omit<DemoTranscriptSegment, 'id' | 'tenantId' | 'encounterId' | 'isFinal' | 'confidence'>> = [
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 0, endMs: 5400, text: 'Hi Avery, good to see you. So this is your annual wellness visit. How are you feeling overall since we last met?' },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 5800, endMs: 16200, text: "Pretty good, mostly. I've had this nagging fatigue in the afternoons for the past two months or so. I sleep okay, maybe seven hours, but I crash hard around three." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 16500, endMs: 22000, text: 'Got it. Any change in appetite, weight, mood? Are you exercising the same as before?' },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 22400, endMs: 33800, text: 'Weight is the same I think. Mood is fine. I run twice a week, usually on weekends. Honestly the fatigue is the main thing. And I get a bit cold even when nobody else is.' },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 34100, endMs: 40000, text: 'Mhm. Any palpitations, chest pain, shortness of breath when you run?' },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 40300, endMs: 44600, text: 'No, nothing like that. Just tired.' },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 44900, endMs: 53200, text: 'Okay. Let me listen to your heart and lungs. Take a deep breath for me. Good. And again. Good.' },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 53500, endMs: 64800, text: 'Heart sounds regular, no murmurs. Lungs are clear. Blood pressure today was one twenty-two over seventy-eight, pulse seventy. BMI is right at twenty-three, which is unchanged.' },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 65200, endMs: 67400, text: 'Okay. So what do you think it is?' },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 67700, endMs: 82500, text: "The cold intolerance plus afternoon fatigue makes me want to check your thyroid. We'll do a TSH and a free T4. I also want a CBC and a basic metabolic panel since it's been over a year. Iron studies too, just to be safe. We'll send the order today and you can do it at the lab downstairs." },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 82900, endMs: 84800, text: "That makes sense. I'll go right after." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 85100, endMs: 96400, text: "Great. I'll review the results with you in about a week. If the thyroid comes back abnormal we'll talk about next steps then. In the meantime keep your sleep regular and try to get some protein at lunch — sometimes the afternoon crash is just blood sugar." },
  { speakerLabel: 'Avery', speakerRole: 'patient', startMs: 96700, endMs: 98200, text: 'Got it. Thanks Dr. Reyes.' },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 98500, endMs: 102200, text: "You're welcome. We'll be in touch about the labs." },
];

export function buildSeed(now = new Date()): DemoState {
  const nowIso = now.toISOString();
  const sessionStart = new Date(now.getTime() - 1000 * 60 * 30);
  const sessionEnd = new Date(now.getTime() - 1000 * 60 * 10);
  const upcoming = new Date(now.getTime() + 1000 * 60 * 5);

  return {
    version: 1,
    tenant: {
      id: TENANT_ID,
      slug: 'riverside',
      name: 'Riverside Family Practice',
      tier: 'practice',
      dataResidency: 'us',
    },
    clinician: {
      id: CLINICIAN_ID,
      tenantId: TENANT_ID,
      name: 'Dr. Mara Reyes',
      email: 'mreyes@riverside.health',
      roles: ['clinician'],
      specialty: 'family_medicine',
      npi: '1234567893',
    },
    patients: [
      { id: PATIENT_AVERY, tenantId: TENANT_ID, mrn: 'R-1001', givenName: 'Avery', familyName: 'Bhatt', birthDate: '1981-03-12', sex: 'female' },
      { id: PATIENT_THEO, tenantId: TENANT_ID, mrn: 'R-1002', givenName: 'Theo', familyName: 'Okonkwo', birthDate: '1969-09-30', sex: 'male' },
      { id: PATIENT_SAM, tenantId: TENANT_ID, mrn: 'R-1003', givenName: 'Sam', familyName: 'Lindgren', birthDate: '2003-12-04', sex: 'other' },
    ],
    encounters: [
      {
        id: ENCOUNTER_AVERY,
        tenantId: TENANT_ID,
        patientId: PATIENT_AVERY,
        clinicianId: CLINICIAN_ID,
        status: 'awaiting_review',
        mode: 'in_person',
        scheduledAt: null,
        startedAt: sessionStart.toISOString(),
        endedAt: sessionEnd.toISOString(),
        reasonForVisit: 'Annual wellness visit',
      },
      {
        id: ENCOUNTER_THEO_SCHEDULED,
        tenantId: TENANT_ID,
        patientId: PATIENT_THEO,
        clinicianId: CLINICIAN_ID,
        status: 'scheduled',
        mode: 'in_person',
        scheduledAt: upcoming.toISOString(),
        startedAt: null,
        endedAt: null,
        reasonForVisit: 'Follow-up: hypertension management',
      },
    ],
    transcripts: RAW_TRANSCRIPT.map((seg, i) => ({
      ...seg,
      id: SEG_AVERY[i]!,
      tenantId: TENANT_ID,
      encounterId: ENCOUNTER_AVERY,
      confidence: 0.94,
      isFinal: true,
    })),
    notes: [],
  };
}

/** Stable id of the first sentence's segment for the offline note generator. */
export const SEED_SEGMENT_IDS = {
  fatigue: SEG_AVERY[1],
  cold: SEG_AVERY[3],
  noChest: SEG_AVERY[5],
  exam: SEG_AVERY[7],
  plan: SEG_AVERY[9],
  followUp: SEG_AVERY[11],
} as const;
