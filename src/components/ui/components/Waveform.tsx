'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../lib/cn';

export interface WaveformProps {
  active: boolean;
  bars?: number;
  className?: string;
}

/**
 * CSS-only animated audio waveform — no real audio analysis required for the
 * demo. When `active` is true, bars animate at staggered phases to suggest
 * speech amplitude. When false, bars settle to a quiet baseline.
 */
export function Waveform({ active, bars = 28, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Stable per-bar randomness so heights don't reshuffle on each render.
  const heights = useRef<number[]>(
    Array.from({ length: bars }, (_, i) => 0.35 + ((Math.sin(i * 1.7) + 1) / 2) * 0.6),
  );

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty('--waveform-state', active ? 'running' : 'paused');
  }, [active]);

  return (
    <div
      ref={containerRef}
      className={cn('flex items-center gap-[3px] h-10', className)}
      aria-hidden
      style={{ ['--waveform-state' as string]: active ? 'running' : 'paused' }}
    >
      {heights.current.map((h, i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-[oklch(50%_0.14_250)]"
          style={{
            height: `${Math.max(4, h * 28)}px`,
            opacity: active ? 0.9 : 0.35,
            animation: `waveform-pulse ${0.7 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate`,
            animationPlayState: 'var(--waveform-state)',
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-pulse {
          0%   { transform: scaleY(0.35); }
          100% { transform: scaleY(1.05); }
        }
      `}</style>
    </div>
  );
}
