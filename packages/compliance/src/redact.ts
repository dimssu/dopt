const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;
const MRN = /\b(?:MRN|R-)\d{4,}\b/gi;
const DOB = /\b(?:0?[1-9]|1[0-2])[/-](?:0?[1-9]|[12]\d|3[01])[/-](?:19|20)?\d{2}\b/g;
const NPI = /\b\d{10}\b/g;

const REPLACERS: Array<[RegExp, string]> = [
  [EMAIL, '[REDACTED:email]'],
  [PHONE, '[REDACTED:phone]'],
  [SSN, '[REDACTED:ssn]'],
  [MRN, '[REDACTED:mrn]'],
  [DOB, '[REDACTED:dob]'],
  [NPI, '[REDACTED:npi]'],
];

/**
 * Best-effort PHI redaction for log lines and analytics events. Pattern-based,
 * not name-based — names are too ambiguous to redact safely without a
 * dedicated NER pass. Use for telemetry and error reports, NOT as a substitute
 * for keeping PHI out of these channels in the first place.
 */
export function redact(input: string): string {
  let out = input;
  for (const [pattern, replacement] of REPLACERS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function redactObject<T>(value: T): T {
  if (typeof value === 'string') {
    return redact(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => redactObject(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redactObject(v);
    }
    return out as unknown as T;
  }
  return value;
}
