import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/cn.js';

const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 font-medium select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-[background,color,border,box-shadow] duration-150 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[oklch(50%_0.14_250)] text-white hover:bg-[oklch(46%_0.15_250)] focus-visible:ring-[oklch(50%_0.14_250)]',
        secondary:
          'bg-white text-[oklch(20%_0.02_240)] border border-[oklch(88%_0.01_240)] hover:bg-[oklch(98%_0.005_240)] focus-visible:ring-[oklch(50%_0.14_250)]',
        ghost:
          'bg-transparent text-[oklch(20%_0.02_240)] hover:bg-[oklch(96%_0.008_240)] focus-visible:ring-[oklch(50%_0.14_250)]',
        danger:
          'bg-[oklch(55%_0.18_25)] text-white hover:opacity-90 focus-visible:ring-[oklch(55%_0.18_25)]',
      },
      size: {
        sm: 'h-8 px-3 text-[13px] rounded-md',
        md: 'h-10 px-4 text-[14px] rounded-lg',
        lg: 'h-12 px-5 text-[15px] rounded-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
});
