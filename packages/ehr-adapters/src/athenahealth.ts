import { FHIRAdapter } from './fhir/index.js';
import type { AdapterConfig } from './adapter.js';

export class AthenahealthAdapter extends FHIRAdapter {
  override readonly kind = 'athenahealth';
  constructor(config: AdapterConfig) {
    super(config);
  }
}
