/**
 * The same conversation written into the seed for the awaiting-review encounter,
 * but here it's used to play back a *new* live capture so the demo flow doesn't
 * need a real microphone or ASR. Wall-clock playback is roughly 1 minute.
 *
 * When real ASR lands (M2), this fixture is replaced by frames coming over the
 * WebSocket from apps/transcription-svc — the rest of the UI doesn't change.
 */

export interface MockSegment {
  speakerLabel: string;
  speakerRole: 'clinician' | 'patient' | 'caregiver' | 'other';
  startMs: number;
  endMs: number;
  text: string;
}

export const MOCK_CONVERSATION: MockSegment[] = [
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 0, endMs: 5400, text: "Hi Theo, how have you been feeling since we last adjusted your blood pressure medication?" },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 5800, endMs: 16500, text: "Pretty good for the most part. The headaches I used to get in the morning are gone. I do feel a little lightheaded sometimes when I stand up too fast though." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 16800, endMs: 23000, text: "Mm. Have you been checking your pressure at home like we talked about?" },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 23300, endMs: 32400, text: "Yeah, most mornings. It's been running around one twenty-five over seventy-eight, give or take. A couple times it dipped into the one teens." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 32700, endMs: 38400, text: "That's a good range. Any chest pain, shortness of breath, swelling in your legs?" },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 38700, endMs: 41800, text: "No, none of that." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 42100, endMs: 49000, text: "How's your diet and the walking we discussed? Are you still doing thirty minutes most days?" },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 49300, endMs: 58200, text: "I'm walking about four days a week. Diet is okay — I cut back on the salt mostly. Wife reminds me." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 58500, endMs: 67800, text: "Good. Let me check your pressure today. One twenty-four over seventy-six, pulse sixty-eight. Heart sounds regular, lungs clear, no edema in your ankles." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 68100, endMs: 79500, text: "I think we'll keep your lisinopril at ten milligrams. The lightheadedness on standing is mild — drink a bit more water and rise slowly. If it gets worse or you feel like you might pass out, call us." },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 79800, endMs: 82200, text: "Got it. Same dose, more water." },
  { speakerLabel: 'Dr. Reyes', speakerRole: 'clinician', startMs: 82500, endMs: 91800, text: "Right. I want to see you again in three months. Let's also get a basic metabolic panel before that visit so we can check your kidney function on the medication." },
  { speakerLabel: 'Theo', speakerRole: 'patient', startMs: 92100, endMs: 94200, text: "Sounds good. Thanks." },
];
