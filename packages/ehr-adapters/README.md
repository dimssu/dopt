# @clinical-notes/ehr-adapters

Adapters from the platform's canonical types to external healthcare systems.

- `FHIRAdapter` — canonical FHIR R4 mapping. Other adapters compose on top of it.
- `buildAdtA04` and friends — HL7v2 message generation.
- Vendor stubs: `EpicAdapter`, `CernerAdapter`, `AthenahealthAdapter`, `DrChronoAdapter` — share FHIR mappings, override auth and quirky endpoints. Real network calls behind feature flags until live integration tests exist.

Owned by `integrations-engineer`. New adapters require an architect ADR and a contract test against recorded fixtures.
