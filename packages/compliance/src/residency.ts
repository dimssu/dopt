import type { DataResidency } from '@clinical-notes/types';

const ALLOWED_PROVIDERS_BY_REGION: Record<DataResidency, { storage: string[]; llm: string[]; asr: string[] }> = {
  us: {
    storage: ['s3:us-east-1', 's3:us-west-2'],
    llm: ['anthropic:us'],
    asr: ['whisper_local', 'deepgram:us'],
  },
  eu: {
    storage: ['s3:eu-central-1', 's3:eu-west-1'],
    llm: ['anthropic:eu'],
    asr: ['whisper_local', 'deepgram:eu'],
  },
  uk: {
    storage: ['s3:eu-west-2'],
    llm: ['anthropic:eu'],
    asr: ['whisper_local'],
  },
  ca: {
    storage: ['s3:ca-central-1'],
    llm: ['anthropic:us'],
    asr: ['whisper_local'],
  },
  au: {
    storage: ['s3:ap-southeast-2'],
    llm: ['anthropic:us'],
    asr: ['whisper_local'],
  },
};

export class ResidencyViolation extends Error {
  constructor(
    public readonly region: DataResidency,
    public readonly category: 'storage' | 'llm' | 'asr',
    public readonly target: string,
  ) {
    super(`Provider ${target} not allowed for ${category} in region ${region}`);
    this.name = 'ResidencyViolation';
  }
}

export function assertAllowed(region: DataResidency, category: 'storage' | 'llm' | 'asr', target: string): void {
  const allowed = ALLOWED_PROVIDERS_BY_REGION[region][category];
  if (!allowed.includes(target)) {
    throw new ResidencyViolation(region, category, target);
  }
}

export function allowedProviders(region: DataResidency) {
  return ALLOWED_PROVIDERS_BY_REGION[region];
}
