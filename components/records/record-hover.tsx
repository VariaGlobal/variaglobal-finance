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
 * Instant hover summary for any record reference. Strict spec:
 * header = record type + name; max 4 rows of muted label + tabular
 * value + as-of date; footer = "Open record →". Matched payments show
 * the linked chain. No paragraphs, no loading states — everything
 * renders synchronously from fixtures.
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
      <HoverCardContent side="bottom" align="start" className="w-80 p-0">
        {/* Header: record type + name */}
        <div className="flex items-baseline gap-2 border-b border-border px-3 py-2">
          <span className="text-[11px] tracking-wide text-muted-foreground/70 uppercase">
            {summary.type}
          </span>
          <span className="truncate text-sm font-medium text-foreground">{summary.title}</span>
        </div>

        {/* Rows: muted label · tabular value · as-of date. Max 4. */}
        <dl className="flex flex-col gap-1.5 px-3 py-2.5">
          {summary.rows.slice(0, 4).map((row) => (
            <div key={row.label} className="flex items-baseline gap-3">
              <dt className="w-20 shrink-0 text-xs text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 flex-1 text-right">
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {row.value}
                </span>
                {row.asOf && (
                  <span className="ml-1.5 text-[11px] text-muted-foreground/70">
                    {row.asOf}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* Linked chain for matched payment records */}
        {summary.chain && (
          <p className="border-t border-border px-3 py-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            {summary.chain}
          </p>
        )}

        {/* Footer */}
        <div className="border-t border-border px-3 py-2">
          {onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="text-xs text-foreground/70 transition-colors duration-150 hover:text-foreground"
            >
              {'Open record →'}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground/60">{'Open record →'}</span>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
