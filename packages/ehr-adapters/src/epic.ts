import { FHIRAdapter } from './fhir/index.js';
import type { AdapterConfig } from './adapter.js';

/**
 * Epic adapter. Epic exposes FHIR R4 + custom OAuth flows. We delegate the
 * mapping to the FHIR adapter and override only the auth and search semantics
 * that differ. Network calls behind a feature flag in dev.
 */
export class EpicAdapter extends FHIRAdapter {
  override readonly kind = 'epic';
  constructor(config: AdapterConfig) {
    super(config);
  }
}
