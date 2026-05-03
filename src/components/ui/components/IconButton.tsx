import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // accessible name; rendered as title + aria-label
  size?: 'sm' | 'md';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-[oklch(40%_0.015_240)] hover:bg-[oklch(96%_0.008_240)] hover:text-[oklch(20%_0.02_240)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)] disabled:opacity-50 transition-colors',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
