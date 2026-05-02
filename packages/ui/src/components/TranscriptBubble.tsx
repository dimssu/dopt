import { type ReactNode } from 'react';
import { cn } from '../lib/cn.js';

export interface TranscriptBubbleProps {
  speakerLabel: string;
  speakerRole: 'clinician' | 'patient' | 'caregiver' | 'other';
  isFinal: boolean;
  startMs: number;
  children: ReactNode;
  highlighted?: boolean;
}

const roleStyles: Record<TranscriptBubbleProps['speakerRole'], string> = {
  clinician: 'border-l-[oklch(50%_0.14_250)]',
  patient: 'border-l-[oklch(60%_0.12_155)]',
  caregiver: 'border-l-[oklch(70%_0.12_70)]',
  other: 'border-l-[oklch(70%_0.015_240)]',
};

function formatTimestamp(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TranscriptBubble({
  speakerLabel,
  speakerRole,
  isFinal,
  startMs,
  children,
  highlighted = false,
}: TranscriptBubbleProps) {
  return (
    <div
      className={cn(
        'border-l-2 pl-4 pr-2 py-2 transition-colors duration-200',
        roleStyles[speakerRole],
        highlighted && 'bg-[oklch(96%_0.02_250)]',
        !isFinal && 'opacity-70',
      )}
      data-final={isFinal}
    >
      <div className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.04em] text-[oklch(55%_0.012_240)]">
        <span className="font-medium text-[oklch(40%_0.015_240)]">{speakerLabel}</span>
        <span aria-hidden>·</span>
        <span>{formatTimestamp(startMs)}</span>
        {!isFinal && <span className="text-[oklch(70%_0.12_70)]">live</span>}
      </div>
      <div className="mt-1 text-[15px] leading-[1.55] text-[oklch(20%_0.02_240)]">{children}</div>
    </div>
  );
}
