'use client'

import { cn } from '@/lib/utils'

/** Health/status dot. Green = healthy, amber = attention, red = down. */
export function HealthDot({
  tone,
  className,
}: {
  tone: 'ok' | 'warn' | 'down'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-1.5 shrink-0 rounded-full',
        tone === 'ok' && 'bg-prepared',
        tone === 'warn' && 'bg-decision',
        tone === 'down' && 'bg-variance',
        className,
      )}
    />
  )
}

/** Small on/off toggle rendered as text — state, not decoration. */
export function MiniToggle({
  on,
  onLabel = 'On',
  offLabel = 'Off',
  onToggle,
  ariaLabel,
}: {
  on: boolean
  onLabel?: string
  offLabel?: string
  onToggle: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        'inline-flex h-6 items-center rounded-full border border-border px-2.5 font-mono text-[11px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        on
          ? 'text-foreground'
          : 'text-muted-foreground/70 hover:text-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mr-1.5 size-1.5 rounded-full transition-colors duration-150',
          on ? 'bg-prepared' : 'bg-muted-foreground/40',
        )}
      />
      {on ? onLabel : offLabel}
    </button>
  )
}

/** Uppercase micro-heading used to label groups inside a tab. */
export function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}
