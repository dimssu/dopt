import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn.js';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-[oklch(88%_0.01_240)] bg-white px-3 text-[14px] text-[oklch(20%_0.02_240)] placeholder:text-[oklch(55%_0.012_240)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(50%_0.14_250)] focus-visible:ring-offset-1 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
