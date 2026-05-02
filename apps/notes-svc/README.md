# notes-svc

FastAPI note-generation service. Receives a generation request, enqueues a worker job, returns 202. The worker fetches transcript segments, builds a per-specialty prompt with prompt-cached system instructions, calls the LLM, parses citation-bearing structured output, runs an auto-coder pass for ICD-10/CPT, and writes the resulting `Note` via the API's internal callback.

`prompts/` holds versioned per-specialty templates. `evals/` holds the regression suite — CI fails any prompt change that regresses a specialty by more than 2 percentage points.

Owned by `ml-engineer`.
