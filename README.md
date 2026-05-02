# Clinical Notes — demo

A clickable demo of an AI clinical scribe. Capture a doctor–patient conversation, generate a structured SOAP note in seconds, and review it side-by-side with the transcript — every sentence in the note links back to the moment in the conversation that supports it.

Single Next.js app, deployable to Vercel with no backend, no database, and no infrastructure. All "data" lives in your browser's localStorage. The only server-side surface is one route handler that proxies to the Anthropic API for real note generation; without an API key it falls back to a deterministic offline note so the demo always works.

## Try it locally

Requires Node 20.11+ and pnpm 9.

```sh
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Try the demo**.

To use the real Claude model instead of the offline fallback, copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`:

```sh
cp .env.example .env.local
# then edit .env.local
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dimssu/dopt)

Or manually: connect this repo in the Vercel dashboard. Zero configuration needed — Vercel detects Next.js automatically. Optionally set `ANTHROPIC_API_KEY` in **Project Settings → Environment Variables** to enable real model output; without it, generation uses the deterministic offline note.

## Demo flow (≈ 2 minutes)

See [docs/demo-script.md](docs/demo-script.md) for the talk-track. Headline:

1. The dashboard shows two encounters: *Avery Bhatt — SOAP draft* (transcript and note already generated from the seed) and *Theo Okonkwo — Scheduled*.
2. Click *Avery Bhatt* → review screen with the transcript on the left, the SOAP note on the right. Click any `[m:ss]` citation in the note → the matching transcript bubble highlights and scrolls into view. Click *Sign note* → status flips to *Signed*; refresh the page → still *Signed* (localStorage).
3. Back to the dashboard, click *Start encounter* on Theo. The capture screen plays back a simulated live transcript over about 90 seconds. Click *End encounter & generate note*. A fresh SOAP note is generated, citations point at this conversation, and you land in review.
4. Click *Reset demo* on the dashboard at any time to restore the original seed.

## What's faked vs. real

| Faked | Real |
|---|---|
| Live audio capture (the capture screen plays back a hardcoded conversation) | The structured SOAP output, the citation linking, the note-review UX |
| Authentication, multi-tenant isolation, RBAC, audit chain | The Anthropic API call (when `ANTHROPIC_API_KEY` is set) |
| EHR push, FHIR/HL7 round-trip, billing codes wired to a code-set service | Code suggestions in the note (model-generated or hand-crafted offline) |
| Database, server, queues — everything is the browser plus one Next route handler | The design system primitives, dark-mode-ready tokens, accessible primitives |

## Repo layout

```
clinical-notes/
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx                        marketing landing
│   │   ├── api/notes/generate/route.ts     Anthropic proxy + offline fallback
│   │   └── app/
│   │       ├── dashboard/
│   │       └── encounter/[id]/{capture,review}/
│   ├── components/ui/                      design system + tokens
│   ├── lib/
│   │   ├── store.ts                        localStorage repository
│   │   ├── seed.ts                         initial fixture
│   │   ├── api.ts                          thin client over store + generate
│   │   ├── note-generator.ts               server-only note generation
│   │   ├── prompts/soap.ts
│   │   └── mock-conversation.ts            playback fixture for live capture
│   └── types/                              Zod schemas (storage-agnostic)
├── docs/demo-script.md
└── .github/workflows/ci.yml                install + typecheck + build
```

## License

TBD.
