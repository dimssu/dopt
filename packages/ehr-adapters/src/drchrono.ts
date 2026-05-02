import { FHIRAdapter } from './fhir/index.js';
import type { AdapterConfig } from './adapter.js';

export class DrChronoAdapter extends FHIRAdapter {
  override readonly kind = 'drchrono';
  constructor(config: AdapterConfig) {
    super(config);
  }
}
