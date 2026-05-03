import { cn } from '../lib/cn';

/**
 * Mark for the product. A stylised stethoscope earpiece + speech-line motif —
 * conveys "listening clinician" without being literal. Kept monochromatic so
 * it inherits whatever color the surrounding text uses.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      className={cn('block', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M9 11.4 V15 a5 5 0 0 0 5 5 h2 a3.5 3.5 0 0 0 3.5 -3.5 V13" />
      <circle cx="19.5" cy="11" r="2.2" />
      <path d="M22.6 17.5 c0.9 0 1.6 0.7 1.6 1.6 v1.4 c0 0.9 -0.7 1.6 -1.6 1.6 c-0.9 0 -1.6 -0.7 -1.6 -1.6 v-1.4 c0 -0.9 0.7 -1.6 1.6 -1.6 z" />
    </svg>
  );
}
