import { type HTMLAttributes } from 'react';
import { cn } from '../lib/cn.js';

export interface CitationLinkProps extends HTMLAttributes<HTMLButtonElement> {
  segmentId: string;
  startMs: number;
  endMs: number;
  onCitationActivate: (segmentId: string, startMs: number, endMs: number) => void;
}

export function CitationLink({
  segmentId,
  startMs,
  endMs,
  onCitationActivate,
  className,
  ...props
}: CitationLinkProps) {
  return (
    <button
      type="button"
      onClick={() => onCitationActivate(segmentId, startMs, endMs)}
      className={cn(
        'inline-flex items-baseline align-baseline rounded-sm px-1 -mx-1 text-[oklch(50%_0.14_250)] underline decoration-dotted underline-offset-2 hover:bg-[oklch(96%_0.02_250)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)]',
        className,
      )}
      {...props}
    />
  );
}
