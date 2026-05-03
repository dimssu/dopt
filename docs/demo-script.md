# Demo script

Roughly three minutes, suitable for a stakeholder walk-through, screen recording, or a doctor's first look. Assumes the quick-start in the README has been completed.

## Setup checklist

- [ ] `pnpm dev` is running and you can reach `http://localhost:3000` (or open the deployed Vercel URL — same demo).
- [ ] If a previous session left state behind, click *Reset demo* on the dashboard so the seed is fresh: *Avery Bhatt* under Awaiting review and *Theo Okonkwo* under Scheduled.
- [ ] Your terminal is hidden or de-cluttered.
- [ ] If you want model-generated notes rather than the deterministic offline fallback, `ANTHROPIC_API_KEY` is set (in `.env.local` for local dev, or Vercel env for the deploy).

## Talk track

### Beat 1 — the landing (10 s)

> "This is what a small practice or hospital signing up for the platform sees first. Calm, clinical-grade, no AI-template smell. Click *Try the demo*."

Click **Try the demo**. Dashboard loads.

### Beat 2 — the dashboard (15 s)

> "Two encounters today. The top one ended a few minutes ago and is awaiting the doctor's review. The bottom one is scheduled and ready to start. This is what a clinician opens to in the morning."

### Beat 3 — review an existing note (60 s)

Click **Avery Bhatt**.

> "The transcript of the visit is on the left. The generated SOAP note is on the right. Notice every sentence in the note has a citation — these little timestamps."

Hover over a citation, then click it. Transcript scrolls and highlights.

> "Each citation links the sentence back to the exact moment in the conversation that supports it. The doctor doesn't have to trust the AI — they can verify in one click. This is the part that makes clinicians comfortable signing."

Scroll down to *Suggested codes*.

> "Below the note, the system suggests ICD-10 and CPT codes with confidence. The doctor accepts the ones they want; the rest get dropped. This saves a separate round of billing review."

Click **Sign note**.

> "Sign locks the note. From this moment it's an immutable medical record. Every subsequent change is an amendment with its own audit trail."

### Beat 4 — capture a new encounter (75 s)

Click **← Dashboard**, then **Start encounter** on Theo's row.

> "In production, this is when the microphone starts. For the demo, we're playing back a sample conversation. The same UI, the same WebSocket, just a fixture instead of a microphone."

Click **Start**. Transcript bubbles appear in real time, speaker-coded by colour stripe (clinician on the left, patient distinguishable).

> "Speaker diarization happens in the transcription service. Medical vocabulary is boosted so drug names, dosages, and lab tests come through correctly. If the network drops, the client buffers locally and resumes."

Wait until the conversation finishes (about 90 seconds), or click **End encounter & generate note** earlier.

> "When the doctor ends the encounter, the transcript is sent for note generation. A few seconds later — "

Review screen loads with the generated note.

> "— a fresh SOAP note, citations tied back to *this* conversation, codes suggested. The doctor reviews, edits if anything is off, and signs. The whole thing took about ninety seconds longer than the visit itself."

### Beat 5 — wrap (20 s)

> "Today's demo is the spine of the product: capture, generate, review, sign. The production build wraps it in per-tenant configuration, BAA-ready compliance posture, and EHR integration over FHIR — none of which is visible in this two-minute flow. Hit *Reset demo* to give the next person the same starting point."

## Talking points if asked

- **"Is this HIPAA compliant?"** Today's demo is not a production system — it stores everything in browser localStorage and has no auth. The product as designed is BAA-ready: encryption at rest and in transit, hash-chained audit, per-tenant data residency, configurable retention, RBAC. Compliance is a posture you sign, not a switch.
- **"What's the model?"** Anthropic Claude. The deployed demo can run with or without a key — set `ANTHROPIC_API_KEY` in Vercel env to use the real model; without it, the offline fallback returns a deterministic note tied to the transcript so the demo is always live.
- **"Why the offline fallback?"** So a fork or a preview build doesn't need a live API key to demo. The fallback is hand-crafted against the seed; for fresh capture flows it falls back to keyword and positional cues so citations still resolve.
- **"How does it integrate with our EHR?"** Not part of this demo. The production target is FHIR R4 (canonical) plus vendor adapters for Epic, Cerner, athenahealth, and DrChrono.
