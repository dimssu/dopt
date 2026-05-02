import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-[oklch(92%_0.008_240)] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04)]',
        className,
      )}
      {...props}
    />
  );
});
