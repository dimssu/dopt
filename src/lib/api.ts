/**
 * Demo "API" — a thin sync wrapper over the localStorage store, plus one async
 * call to /api/notes/generate for the model-backed (or offline-fallback) note
 * generation. No server, no auth, no network beyond the generate route.
 *
 * The page-level call sites match the previous fetch-based shape so the UI
 * code didn't have to change much.
 */

import { store } from './store';
import type {
  DemoEncounter,
  DemoNote,
  DemoTranscriptSegment,
} from './seed';

export type ApiEncounter = DemoEncounter & {
  patient?: { id: string; mrn: string; givenName: string; familyName: string; sex: string };
  clinician?: { id: string; name: string; email: string };
};
export type ApiTranscriptSegment = DemoTranscriptSegment;
export type ApiNote = DemoNote;
export type ApiNoteSentence = DemoNote['sections'][number]['sentences'][number];
export type ApiNoteSection = DemoNote['sections'][number];
export type ApiCodeSuggestion = DemoNote['codes'][number];

function withRelated(enc: DemoEncounter): ApiEncounter {
  const snapshot = store.snapshot();
  const patient = snapshot.patients.find((p) => p.id === enc.patientId);
  const clinician = snapshot.clinician.id === enc.clinicianId ? snapshot.clinician : null;
  return {
    ...enc,
    patient: patient
      ? {
          id: patient.id,
          mrn: patient.mrn,
          givenName: patient.givenName,
          familyName: patient.familyName,
          sex: patient.sex,
        }
      : undefined,
    clinician: clinician
      ? { id: clinician.id, name: clinician.name, email: clinician.email }
      : undefined,
  };
}

export const api = {
  reset(): void {
    store.reset();
  },

  listEncounters(): { data: ApiEncounter[] } {
    const list = store
      .listEncounters()
      .map(withRelated)
      .sort((a, b) => {
        const at = a.startedAt ?? a.scheduledAt ?? '';
        const bt = b.startedAt ?? b.scheduledAt ?? '';
        return bt.localeCompare(at);
      });
    return { data: list };
  },

  getEncounter(id: string): ApiEncounter {
    const enc = store.getEncounter(id);
    if (!enc) throw new Error('Encounter not found');
    return withRelated(enc);
  },

  startEncounter(id: string): ApiEncounter {
    const enc = store.startEncounter(id);
    if (!enc) throw new Error('Encounter not found');
    return withRelated(enc);
  },

  endEncounter(id: string): ApiEncounter {
    const enc = store.endEncounter(id);
    if (!enc) throw new Error('Encounter not found');
    return withRelated(enc);
  },

  listTranscript(encounterId: string): { data: ApiTranscriptSegment[] } {
    return { data: store.listTranscript(encounterId).sort((a, b) => a.startMs - b.startMs) };
  },

  bulkTranscript(
    encounterId: string,
    segments: Array<Omit<ApiTranscriptSegment, 'id' | 'tenantId' | 'encounterId'>>,
    replace = true,
  ): { count: number } {
    const created = store.bulkTranscript(encounterId, segments, replace);
    return { count: created.length };
  },

  getNoteByEncounter(encounterId: string): ApiNote | null {
    return store.getNoteByEncounter(encounterId);
  },

  async generateNote(encounterId: string): Promise<ApiNote> {
    const transcript = store.listTranscript(encounterId).sort((a, b) => a.startMs - b.startMs);
    if (transcript.length === 0) {
      throw new Error('Encounter has no transcript yet.');
    }
    const res = await fetch('/api/notes/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        format: 'soap',
        transcript: transcript.map((s) => ({
          id: s.id,
          speakerLabel: s.speakerLabel,
          startMs: s.startMs,
          endMs: s.endMs,
          text: s.text,
        })),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Generation failed (${res.status}): ${detail || res.statusText}`);
    }
    const generated = (await res.json()) as Pick<ApiNote, 'sections' | 'codes'>;
    const note = store.saveNote({
      encounterId,
      format: 'soap',
      status: 'draft',
      templateId: null,
      sections: generated.sections,
      codes: generated.codes,
      signedById: null,
      signedAt: null,
      generatedAt: new Date().toISOString(),
    });
    store.endEncounter(encounterId);
    return note;
  },

  signNote(id: string): ApiNote {
    const note = store.signNote(id);
    if (!note) throw new Error('Note not found');
    return note;
  },
};
