import { cn } from '../lib/cn';

const PALETTE = [
  'oklch(86% 0.05 250)',
  'oklch(86% 0.05 155)',
  'oklch(86% 0.07 70)',
  'oklch(86% 0.06 25)',
  'oklch(86% 0.06 320)',
  'oklch(86% 0.06 200)',
];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-12 w-12 text-[15px]',
} as const;

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  const colour = PALETTE[hashSeed(name) % PALETTE.length];
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-[oklch(20%_0.02_240)] tracking-[-0.01em] ring-1 ring-inset ring-[oklch(0%_0_0_/_0.03)]',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: colour }}
    >
      {initials || '?'}
    </div>
  );
}
