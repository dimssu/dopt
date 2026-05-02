/**
 * Browser-side API client. Uses a baked demo session for the MVP — real auth
 * (Auth.js or SAML/OIDC) lands in M4. The session string format mirrors the
 * dev-fallback in apps/api/src/middleware/auth.ts.
 *
 *   <userId>:<tenantId>:<comma-separated roles>:<sessionId>
 *
 * The IDs match the deterministic UUIDs written by packages/db/prisma/seed.ts.
 */

const DEMO_SESSION =
  '22222222-2222-2222-2222-222222222222:11111111-1111-1111-1111-111111111111:clinician:demo-session-1';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-clinical-session': DEMO_SESSION,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiPatient {
  id: string;
  mrn: string;
  givenName: string;
  familyName: string;
  birthDate: string;
  sex: 'female' | 'male' | 'other' | 'unknown';
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  specialty: string | null;
}

export interface ApiEncounter {
  id: string;
  patientId: string;
  clinicianId: string;
  status: 'scheduled' | 'in_progress' | 'awaiting_review' | 'signed' | 'amended' | 'cancelled';
  mode: 'in_person' | 'telehealth' | 'home_visit';
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  reasonForVisit: string | null;
  patient?: ApiPatient;
  clinician?: ApiUser;
}

export interface ApiTranscriptSegment {
  id: string;
  encounterId: string;
  speakerLabel: string;
  speakerRole: 'clinician' | 'patient' | 'caregiver' | 'other';
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface ApiNoteSentence {
  id: string;
  text: string;
  citations: Array<{ segmentId: string; startMs: number; endMs: number }>;
}

export interface ApiNoteSection {
  id: string;
  key: string;
  title: string;
  sentences: ApiNoteSentence[];
  manualEdits: boolean;
}

export interface ApiCodeSuggestion {
  system: 'icd10' | 'cpt' | 'snomed' | 'rxnorm';
  code: string;
  display: string;
  confidence: number;
}

export interface ApiNote {
  id: string;
  encounterId: string;
  format: 'soap' | 'hp' | 'progress' | 'discharge' | 'referral' | 'custom';
  status: 'draft' | 'awaiting_review' | 'signed' | 'amended';
  sections: ApiNoteSection[];
  codes: ApiCodeSuggestion[];
  signedAt: string | null;
  signedById: string | null;
  generatedAt: string;
}

export const api = {
  listEncounters: () => request<{ data: ApiEncounter[] }>('/v1/encounters'),
  getEncounter: (id: string) => request<ApiEncounter>(`/v1/encounters/${id}`),
  startEncounter: (id: string) =>
    request<ApiEncounter>(`/v1/encounters/${id}/start`, { method: 'POST', body: '{}' }),
  endEncounter: (id: string) =>
    request<ApiEncounter>(`/v1/encounters/${id}/end`, { method: 'POST', body: '{}' }),

  listTranscript: (encounterId: string) =>
    request<{ data: ApiTranscriptSegment[] }>(`/v1/transcripts/${encounterId}`),
  bulkTranscript: (
    encounterId: string,
    segments: Array<Omit<ApiTranscriptSegment, 'id' | 'encounterId' | 'isFinal' | 'confidence'> & {
      isFinal?: boolean;
      confidence?: number;
    }>,
    replace = true,
  ) =>
    request<{ count: number }>('/v1/transcripts/bulk', {
      method: 'POST',
      body: JSON.stringify({ encounterId, segments, replace }),
    }),

  generateNote: (encounterId: string) =>
    request<ApiNote>('/v1/notes/generate', {
      method: 'POST',
      body: JSON.stringify({ encounterId, format: 'soap' }),
    }),
  getNoteByEncounter: (encounterId: string) =>
    request<ApiNote>(`/v1/notes/encounter/${encounterId}`),
  signNote: (id: string) =>
    request<ApiNote>(`/v1/notes/${id}/sign`, { method: 'POST', body: '{}' }),
};
