import { cn } from '../lib/cn';

export function RecordingPulse({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2.5 w-2.5', className)} aria-hidden>
      <span className="absolute inset-0 rounded-full bg-[oklch(58%_0.2_25)] opacity-75 animate-ping" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[oklch(55%_0.22_25)]" />
    </span>
  );
}
