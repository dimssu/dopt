/**
 * Design tokens. Semantic, not literal — components reference roles, not hexes.
 * Owned by ui-ux-designer. Token changes trigger a design sweep on the
 * implemented surface.
 *
 * Aesthetic note: Linear meets Epic. Restrained. One accent. Heavy on
 * typography and spacing rhythm; light on chrome.
 */

export const color = {
  surface: {
    base: 'oklch(99% 0.005 240)',
    raised: 'oklch(98% 0.005 240)',
    sunken: 'oklch(96% 0.008 240)',
    inverted: 'oklch(18% 0.02 240)',
  },
  content: {
    primary: 'oklch(20% 0.02 240)',
    secondary: 'oklch(40% 0.015 240)',
    muted: 'oklch(55% 0.012 240)',
    onAccent: 'oklch(99% 0.005 240)',
  },
  border: {
    subtle: 'oklch(92% 0.008 240)',
    default: 'oklch(88% 0.01 240)',
    strong: 'oklch(70% 0.015 240)',
  },
  accent: {
    base: 'oklch(50% 0.14 250)', // measured indigo, not a saas blue
    hover: 'oklch(46% 0.15 250)',
    soft: 'oklch(96% 0.02 250)',
  },
  status: {
    danger: 'oklch(55% 0.18 25)',
    warn: 'oklch(70% 0.12 70)',
    ok: 'oklch(60% 0.12 155)',
  },
} as const;

export const space = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '48px',
  8: '64px',
  9: '96px',
} as const;

export const radius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const typography = {
  display: { size: '32px', weight: 600, lineHeight: '1.15', tracking: '-0.02em' },
  title: { size: '24px', weight: 600, lineHeight: '1.2', tracking: '-0.01em' },
  heading: { size: '18px', weight: 600, lineHeight: '1.3', tracking: '-0.005em' },
  body: { size: '15px', weight: 400, lineHeight: '1.55', tracking: '0' },
  bodyStrong: { size: '15px', weight: 500, lineHeight: '1.55', tracking: '0' },
  caption: { size: '13px', weight: 400, lineHeight: '1.45', tracking: '0' },
  micro: { size: '11px', weight: 500, lineHeight: '1.3', tracking: '0.04em' },
} as const;

export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const elevation = {
  flat: 'none',
  raised: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
  popover: '0 4px 12px rgb(0 0 0 / 0.08), 0 12px 32px -4px rgb(0 0 0 / 0.08)',
  modal: '0 8px 24px rgb(0 0 0 / 0.12), 0 24px 64px -8px rgb(0 0 0 / 0.16)',
} as const;
