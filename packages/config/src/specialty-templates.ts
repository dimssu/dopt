import { z } from 'zod';

export const TemplateSection = z.object({
  key: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  guidance: z.string().min(1),
  required: z.boolean().default(true),
});
export type TemplateSection = z.infer<typeof TemplateSection>;

export const SpecialtyTemplate = z.object({
  specialty: z.string(),
  format: z.enum(['soap', 'hp', 'progress', 'discharge', 'referral', 'custom']),
  sections: z.array(TemplateSection).min(1),
  vocabulary: z.array(z.string()).default([]),
});
export type SpecialtyTemplate = z.infer<typeof SpecialtyTemplate>;

const soap = (specialty: string, vocab: string[]): SpecialtyTemplate => ({
  specialty,
  format: 'soap',
  vocabulary: vocab,
  sections: [
    { key: 'subjective', title: 'Subjective', guidance: 'Patient-reported history of present illness, ROS, relevant PMH/social.', required: true },
    { key: 'objective', title: 'Objective', guidance: 'Vitals, exam findings, lab and imaging results.', required: true },
    { key: 'assessment', title: 'Assessment', guidance: 'Differential and primary diagnoses with reasoning.', required: true },
    { key: 'plan', title: 'Plan', guidance: 'Treatment, prescriptions, follow-up, patient education.', required: true },
  ],
});

export const DEFAULT_TEMPLATES: Record<string, SpecialtyTemplate> = {
  family_medicine: soap('family_medicine', ['BP', 'HR', 'BMI', 'A1c', 'LDL']),
  cardiology: soap('cardiology', ['EF', 'NYHA', 'troponin', 'BNP', 'NT-proBNP']),
  psychiatry: {
    ...soap('psychiatry', ['PHQ-9', 'GAD-7', 'SI', 'HI']),
    sections: [
      { key: 'chief_complaint', title: 'Chief Complaint', guidance: "Patient's stated reason in their own words.", required: true },
      { key: 'hpi', title: 'History of Present Illness', guidance: 'Onset, duration, severity, triggers, prior episodes.', required: true },
      { key: 'mse', title: 'Mental Status Exam', guidance: 'Appearance, behavior, speech, mood, affect, thought process and content, perception, cognition, insight, judgement.', required: true },
      { key: 'assessment', title: 'Assessment', guidance: 'DSM-5-TR formulation. Risk assessment for SI/HI.', required: true },
      { key: 'plan', title: 'Plan', guidance: 'Pharm and non-pharm. Crisis plan if relevant. Follow-up.', required: true },
    ],
  },
  pediatrics: {
    ...soap('pediatrics', ['weight percentile', 'height percentile', 'BMI percentile']),
    sections: [
      { key: 'subjective', title: 'Subjective (Parent/Guardian Report)', guidance: 'Reported by caregiver; note who is reporting.', required: true },
      { key: 'growth', title: 'Growth & Development', guidance: 'Anthropometrics with percentiles, milestones met/missed.', required: true },
      { key: 'objective', title: 'Objective', guidance: 'Exam findings appropriate for age.', required: true },
      { key: 'assessment', title: 'Assessment', guidance: 'Diagnoses with ICD-10 and developmental considerations.', required: true },
      { key: 'plan', title: 'Plan', guidance: 'Including immunizations due, anticipatory guidance.', required: true },
    ],
  },
  dental: {
    specialty: 'dental',
    format: 'progress',
    vocabulary: ['caries', 'periodontal', 'occlusion', 'restoration', 'endodontic'],
    sections: [
      { key: 'chief_complaint', title: 'Chief Complaint', guidance: "Patient's reason for visit.", required: true },
      { key: 'exam', title: 'Examination', guidance: 'Intraoral, extraoral, periodontal charting summary.', required: true },
      { key: 'diagnosis', title: 'Diagnosis', guidance: 'Tooth-numbered findings.', required: true },
      { key: 'treatment', title: 'Treatment', guidance: 'Procedures performed today, materials, anesthesia.', required: true },
      { key: 'plan', title: 'Treatment Plan', guidance: 'Phased plan, recall interval.', required: true },
    ],
  },
};

export function getTemplate(specialty: string): SpecialtyTemplate {
  return DEFAULT_TEMPLATES[specialty] ?? DEFAULT_TEMPLATES.family_medicine!;
}
