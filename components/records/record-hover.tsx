'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { summaries } from '@/lib/fixtures/records/summaries'

interface RecordHoverProps {
  recordId: string
  /** The inline reference the card attaches to. */
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

/**
 * Instant hover summary for any record reference — person, client, cycle,
 * invoice, or document. Facts come synchronously from fixtures; there is
 * no loading state by design.
 */
export function RecordHover({ recordId, children, className, onClick }: RecordHoverProps) {
  const summary = summaries[recordId]

  const trigger = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-baseline text-left underline decoration-border underline-offset-[3px] transition-colors duration-150 outline-none',
        'hover:decoration-foreground/50 focus-visible:ring-2 focus-visible:ring-ring/50',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
    >
      {children}
    </button>
  )

  if (!summary) return trigger

  return (
    <HoverCard delay={0} closeDelay={80}>
      <HoverCardTrigger render={trigger} />
      <HoverCardContent side="bottom" align="start" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-sm font-medium text-foreground">{summary.title}</p>
          <p className="text-meta mt-0.5">{summary.meta}</p>
        </div>
        <dl className="flex flex-col gap-1.5 px-3 py-2.5">
          {summary.facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-3">
              <dt className="shrink-0 text-xs text-muted-foreground">{fact.label}</dt>
              <dd
                className={cn(
                  'text-right text-xs text-foreground',
                  fact.mono && 'font-mono tabular-nums',
                )}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </HoverCardContent>
    </HoverCard>
  )
}
