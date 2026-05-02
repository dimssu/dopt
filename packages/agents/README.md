# @clinical-notes/agents

Agent runtime: provider-abstracted LLM client and tool registry shared by `apps/notes-svc` (Python wrapper) and `apps/api` (TS). Per-tenant model routing respects `DataResidency`.

Owned by `ml-engineer` (prompts and providers) and `backend-engineer` (runtime plumbing). All LLM keys are read from tenant config — never hardcoded.
