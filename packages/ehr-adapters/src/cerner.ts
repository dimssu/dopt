import { FHIRAdapter } from './fhir/index.js';
import type { AdapterConfig } from './adapter.js';

export class CernerAdapter extends FHIRAdapter {
  override readonly kind = 'cerner';
  constructor(config: AdapterConfig) {
    super(config);
  }
}
