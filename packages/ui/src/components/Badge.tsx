import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn.js';

const badgeStyles = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em]',
  {
    variants: {
      tone: {
        neutral: 'bg-[oklch(96%_0.008_240)] text-[oklch(40%_0.015_240)]',
        accent: 'bg-[oklch(96%_0.02_250)] text-[oklch(40%_0.14_250)]',
        ok: 'bg-[oklch(96%_0.04_155)] text-[oklch(35%_0.12_155)]',
        warn: 'bg-[oklch(96%_0.05_70)] text-[oklch(40%_0.12_70)]',
        danger: 'bg-[oklch(96%_0.05_25)] text-[oklch(40%_0.18_25)]',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}
