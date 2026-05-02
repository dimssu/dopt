# Demo script

Roughly three minutes, suitable for a stakeholder walk-through, screen recording, or a doctor's first look. Assumes the quick-start in the README has been completed.

## Setup checklist

- [ ] `pnpm dev` is running and you can reach `http://localhost:3000`.
- [ ] The database is seeded — the dashboard shows *Avery Bhatt* under Awaiting review and *Theo Okonkwo* under Scheduled.
- [ ] Your terminal is hidden or de-cluttered.
- [ ] If you want the model-generated note rather than the offline fallback, `ANTHROPIC_API_KEY` is set in `.env`.

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

> "Behind that flow there's per-tenant configuration — branding, specialty templates, compliance posture, EHR integration — that we haven't shown today. There's a hash-chained audit trail of every PHI read and write, a data-residency router that keeps a tenant's traffic in the region they bought in, and adapters to push the signed note to Epic or Cerner via FHIR. That's the rest of the road map."

## Talking points if asked

- **"Is this HIPAA compliant?"** The architecture is BAA-ready: encryption at rest and in transit, hash-chained audit, per-tenant data residency, configurable retention, RBAC. Compliance is a posture you sign, not a switch — see `docs/compliance/` for the control mapping.
- **"What's the model?"** Anthropic Claude (configurable per tenant). Provider routing respects data residency and is gated by an allow-list maintained by the compliance officer.
- **"Why the offline fallback?"** The MVP runs without an API key so demos and CI don't depend on a live model. The fallback note is hand-crafted against the seeded transcript and points at real seeded segments.
- **"How does it integrate with our EHR?"** FHIR R4 round-trip works against the included HAPI sandbox. Vendor adapters (Epic, Cerner, athenahealth, DrChrono) share the FHIR canonical mapping and override the auth and quirky endpoints. Sandbox round-trip in M5.
