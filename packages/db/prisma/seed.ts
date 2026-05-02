import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const CLINICIAN_ID = '22222222-2222-2222-2222-222222222222';
const PATIENT_AVERY = '33333333-3333-3333-3333-333333333301';
const PATIENT_THEO = '33333333-3333-3333-3333-333333333302';
const PATIENT_SAM = '33333333-3333-3333-3333-333333333303';
const ENCOUNTER_AVERY = '44444444-4444-4444-4444-444444444401';
const ENCOUNTER_THEO_SCHEDULED = '44444444-4444-4444-4444-444444444402';

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: {
      id: TENANT_ID,
      slug: 'riverside',
      name: 'Riverside Family Practice',
      tier: 'practice',
      dataResidency: 'us',
      config: {
        version: 1,
        tier: 'practice',
        dataResidency: 'us',
        branding: {
          name: 'Riverside Family Practice',
          logoUrl: null,
          primaryColor: '#1E3A8A',
        },
        locale: { language: 'en-US', timezone: 'America/New_York', dateFormat: 'MMM d, yyyy', measurement: 'imperial' },
        retention: { audioDays: 30, transcriptDays: 2555, noteDays: 2555, auditDays: 2555 },
        features: { ambientCapture: true, pushToTalk: true, autoCoding: true, smartOnFhir: false, hl7v2: false, customTemplates: true, patientPortal: false },
        providers: { asrPrimary: 'whisper_local', asrFallback: 'deepgram', llmProvider: 'anthropic', llmModel: 'claude-sonnet-4-6' },
        defaultNoteFormat: 'soap',
        defaultSpecialty: 'family_medicine',
        signatureBlock: { text: 'Riverside Family Practice · 100 River Rd · Cambridge, MA', includeNpi: true, includeAddress: true },
        vocabulary: [],
      },
    },
  });

  const clinician = await prisma.user.upsert({
    where: { id: CLINICIAN_ID },
    update: {},
    create: {
      id: CLINICIAN_ID,
      tenantId: tenant.id,
      email: 'mreyes@riverside.health',
      name: 'Dr. Mara Reyes',
      roles: ['clinician'],
      specialty: 'family_medicine',
      npi: '1234567893',
    },
  });

  await prisma.patient.upsert({
    where: { id: PATIENT_AVERY },
    update: {},
    create: {
      id: PATIENT_AVERY,
      tenantId: tenant.id,
      mrn: 'R-1001',
      givenName: 'Avery',
      familyName: 'Bhatt',
      birthDate: new Date('1981-03-12'),
      sex: 'female',
    },
  });
  await prisma.patient.upsert({
    where: { id: PATIENT_THEO },
    update: {},
    create: {
      id: PATIENT_THEO,
      tenantId: tenant.id,
      mrn: 'R-1002',
      givenName: 'Theo',
      familyName: 'Okonkwo',
      birthDate: new Date('1969-09-30'),
      sex: 'male',
    },
  });
  await prisma.patient.upsert({
    where: { id: PATIENT_SAM },
    update: {},
    create: {
      id: PATIENT_SAM,
      tenantId: tenant.id,
      mrn: 'R-1003',
      givenName: 'Sam',
      familyName: 'Lindgren',
      birthDate: new Date('2003-12-04'),
      sex: 'other',
    },
  });

  // Completed encounter for Avery — has transcript + draft note ready for review.
  await prisma.encounter.upsert({
    where: { id: ENCOUNTER_AVERY },
    update: {},
    create: {
      id: ENCOUNTER_AVERY,
      tenantId: tenant.id,
      patientId: PATIENT_AVERY,
      clinicianId: clinician.id,
      status: 'awaiting_review',
      mode: 'in_person',
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      endedAt: new Date(Date.now() - 1000 * 60 * 10),
      reasonForVisit: 'Annual wellness visit',
    },
  });

  // Scheduled encounter for Theo — clicking "Start encounter" runs through the live capture flow.
  await prisma.encounter.upsert({
    where: { id: ENCOUNTER_THEO_SCHEDULED },
    update: {},
    create: {
      id: ENCOUNTER_THEO_SCHEDULED,
      tenantId: tenant.id,
      patientId: PATIENT_THEO,
      clinicianId: clinician.id,
      status: 'scheduled',
      mode: 'in_person',
      scheduledAt: new Date(Date.now() + 1000 * 60 * 5),
      reasonForVisit: 'Follow-up: hypertension management',
    },
  });

  // Replace any existing transcript for the Avery encounter so the seed is idempotent.
  await prisma.transcriptSegment.deleteMany({ where: { encounterId: ENCOUNTER_AVERY } });
  const segments = MOCK_TRANSCRIPT_AVERY.map((s) => ({
    tenantId: tenant.id,
    encounterId: ENCOUNTER_AVERY,
    speakerLabel: s.speakerLabel,
    speakerRole: s.speakerRole,
    startMs: s.startMs,
    endMs: s.endMs,
    text: s.text,
    confidence: 0.94,
    isFinal: true,
  }));
  for (const data of segments) {
    await prisma.transcriptSegment.create({ data });
  }

  // eslint-disable-next-line no-console
  console.warn(`Seeded tenant ${tenant.slug}: 1 clinician, 3 patients, 2 encounters (1 awaiting review, 1 scheduled), ${segments.length} transcript segments.`);
}

const MOCK_TRANSCRIPT_AVERY: Array<{
  speakerLabel: string;
  speakerRole: 'clinician' | 'patient' | 'caregiver' | 'other';
  startMs: number;
  endMs: number;
  text: string;
}> = [
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

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
