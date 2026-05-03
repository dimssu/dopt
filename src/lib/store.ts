/**
 * Browser-only localStorage repository for the demo. Mirrors the public surface
 * the pages used to call against the API. SSR-safe — methods return seed
 * snapshots when running on the server.
 *
 * The single storage key holds one JSON blob (DemoState). Versioned so a future
 * seed-shape change can detect old browsers and re-seed.
 */

import {
  buildSeed,
  type DemoEncounter,
  type DemoNote,
  type DemoState,
  type DemoTranscriptSegment,
} from './seed';

const STORAGE_KEY = 'clinical-notes:demo:v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function read(): DemoState {
  if (!isBrowser()) return buildSeed();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = buildSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== 1) throw new Error('stale schema');
    return parsed;
  } catch {
    const seed = buildSeed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function write(state: DemoState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function uuid(): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  // Fallback for SSR — not cryptographically meaningful, demo only.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const store = {
  reset(): DemoState {
    const seed = buildSeed();
    write(seed);
    return clone(seed);
  },

  snapshot(): DemoState {
    return clone(read());
  },

  listEncounters(): DemoEncounter[] {
    return clone(read().encounters);
  },

  getEncounter(id: string): DemoEncounter | null {
    const enc = read().encounters.find((e) => e.id === id);
    return enc ? clone(enc) : null;
  },

  startEncounter(id: string): DemoEncounter | null {
    const state = read();
    const idx = state.encounters.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    state.encounters[idx] = {
      ...state.encounters[idx]!,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    write(state);
    return clone(state.encounters[idx]!);
  },

  endEncounter(id: string): DemoEncounter | null {
    const state = read();
    const idx = state.encounters.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    state.encounters[idx] = {
      ...state.encounters[idx]!,
      status: 'awaiting_review',
      endedAt: new Date().toISOString(),
    };
    write(state);
    return clone(state.encounters[idx]!);
  },

  listTranscript(encounterId: string): DemoTranscriptSegment[] {
    return clone(read().transcripts.filter((s) => s.encounterId === encounterId));
  },

  bulkTranscript(
    encounterId: string,
    segments: Array<Omit<DemoTranscriptSegment, 'id' | 'tenantId' | 'encounterId'>>,
    replace: boolean,
  ): DemoTranscriptSegment[] {
    const state = read();
    if (replace) {
      state.transcripts = state.transcripts.filter((s) => s.encounterId !== encounterId);
    }
    const tenantId = state.tenant.id;
    const created: DemoTranscriptSegment[] = segments.map((s) => ({
      ...s,
      id: uuid(),
      tenantId,
      encounterId,
    }));
    state.transcripts.push(...created);
    write(state);
    return clone(created);
  },

  getNoteByEncounter(encounterId: string): DemoNote | null {
    const notes = read()
      .notes.filter((n) => n.encounterId === encounterId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return notes[0] ? clone(notes[0]) : null;
  },

  saveNote(note: Omit<DemoNote, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }): DemoNote {
    const state = read();
    const id = note.id ?? uuid();
    const persisted: DemoNote = {
      id,
      tenantId: state.tenant.id,
      encounterId: note.encounterId,
      format: note.format,
      status: note.status,
      templateId: note.templateId ?? null,
      sections: note.sections,
      codes: note.codes,
      signedById: note.signedById ?? null,
      signedAt: note.signedAt ?? null,
      generatedAt: note.generatedAt ?? new Date().toISOString(),
    };
    const idx = state.notes.findIndex((n) => n.id === id);
    if (idx >= 0) state.notes[idx] = persisted;
    else state.notes.push(persisted);
    write(state);
    return clone(persisted);
  },

  signNote(id: string): DemoNote | null {
    const state = read();
    const idx = state.notes.findIndex((n) => n.id === id);
    if (idx < 0) return null;
    state.notes[idx] = {
      ...state.notes[idx]!,
      status: 'signed',
      signedAt: new Date().toISOString(),
      signedById: state.clinician.id,
    };
    write(state);
    return clone(state.notes[idx]!);
  },
};
