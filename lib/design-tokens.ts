/**
 * Varia Finance design tokens — source of truth for the design system.
 * CSS variables live in app/globals.css; this file documents and exports
 * the same values for programmatic use (motion, spacing, semantics).
 *
 * DNA: Apple Card statement × Linear × Stripe dashboard × Mercury.
 * Dark-first on #0a0a0c. Typography carries hierarchy, whitespace carries
 * grouping, motion explains causality.
 */

export const palette = {
  dark: {
    background: '#0a0a0c',
    card: '#101014',
    popover: '#121217',
    foreground: '#ececee',
    mutedForeground: '#85858f',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#6ea0ff', // the one restrained accent (focus ring, prepared)
  },
  light: {
    background: '#f7f7f8',
    card: '#ffffff',
    foreground: '#141417',
    mutedForeground: '#6d6d76',
    border: 'rgba(20, 20, 23, 0.09)',
    accent: '#2f6fed',
  },
} as const

/** Semantic state colors — use via Tailwind: text-prepared, bg-decision/10, etc. */
export const stateColors = {
  prepared: { dark: '#6ea0ff', light: '#2f6fed' },
  suggestion: { dark: '#45d0c2', light: '#0d9488' },
  decision: { dark: '#f0b45a', light: '#b45309' }, // needs-decision
  variance: { dark: '#ff8a5c', light: '#c2410c' },
  held: { dark: '#ff6369', light: '#dc2626' },
} as const

export type WorkItemStatus = keyof typeof stateColors | 'review'

/** Motion: 150–250ms ease-out, opacity/transform only, nothing bouncy. */
export const motion = {
  fast: 150, // chips, hovers, toggles
  base: 200, // drawers, dialogs
  slow: 250, // row exit on approve (cause → effect)
  easing: 'cubic-bezier(0.25, 1, 0.5, 1)', // ease-out
} as const

/** Spacing scale (px) — mirrors the Tailwind scale we actually use. */
export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64] as const

/** Radius scale (rem). --radius: 0.5rem in CSS. */
export const radius = {
  sm: 0.3,
  md: 0.4,
  lg: 0.5,
  xl: 0.7,
} as const

/** Typography rules. */
export const type = {
  sans: 'Geist',
  mono: 'Geist Mono',
  /** ALL numeric UI uses tabular figures (set globally on <html>). */
  numeric: 'tabular-nums',
  /** Money is always mono, always shows cents. */
  moneyClass: 'font-mono tabular-nums',
} as const
