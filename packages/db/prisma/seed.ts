import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'riverside' },
    update: {},
    create: {
      slug: 'riverside',
      name: 'Riverside Family Practice',
      tier: 'practice',
      dataResidency: 'us',
      config: {
        branding: { primary: '#1E3A8A', logo: null },
        defaultNoteFormat: 'soap',
        signatureBlock: 'Riverside Family Practice · 100 River Rd · Cambridge, MA',
      },
    },
  });

  const clinician = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'mreyes@riverside.health' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'mreyes@riverside.health',
      name: 'Dr. Mara Reyes',
      roles: ['clinician'],
      specialty: 'family_medicine',
      npi: '1234567893',
    },
  });

  const patients = await Promise.all(
    [
      { mrn: 'R-1001', givenName: 'Avery', familyName: 'Bhatt', birthDate: new Date('1981-03-12'), sex: 'female' as const },
      { mrn: 'R-1002', givenName: 'Theo', familyName: 'Okonkwo', birthDate: new Date('1969-09-30'), sex: 'male' as const },
      { mrn: 'R-1003', givenName: 'Sam', familyName: 'Lindgren', birthDate: new Date('2003-12-04'), sex: 'other' as const },
    ].map((p) =>
      prisma.patient.upsert({
        where: { tenantId_mrn: { tenantId: tenant.id, mrn: p.mrn } },
        update: {},
        create: { ...p, tenantId: tenant.id },
      }),
    ),
  );

  await prisma.encounter.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tenant.id,
      patientId: patients[0]!.id,
      clinicianId: clinician.id,
      status: 'awaiting_review',
      mode: 'in_person',
      startedAt: new Date(Date.now() - 1000 * 60 * 30),
      endedAt: new Date(Date.now() - 1000 * 60 * 10),
      reasonForVisit: 'Annual wellness visit',
    },
  });

  // eslint-disable-next-line no-console
  console.warn(`Seeded tenant ${tenant.slug} with ${patients.length} patients`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
