'use client'

import { Badge } from '@/components/ui/badge'
import { RecordsEmpty, SampleDataChip } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { DataSource } from '@/lib/records-api/types'
import type { CycleDisplay } from '@/lib/fixtures/records/cycles'

/**
 * Pay cycles list rail. Each row surfaces the payable total, status, and pay
 * date; selection opens the frozen sheet in the detail pane.
 */
export function CyclesHub({
  cycles,
  selectedId,
  onOpenCycle,
  source = 'live',
}: {
  cycles: CycleDisplay[]
  selectedId: string | null
  onOpenCycle: (id: string) => void
  source?: DataSource
}) {
  if (cycles.length === 0) {
    return (
      <RecordsEmpty
        title="No pay cycles on record."
        subline="Cycles are frozen sheets — every line traces to a timesheet, a rate card, and a ruling."
      />
    )
  }

  return (
    <section aria-label="Pay cycles" className="flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-medium tracking-tight text-foreground">Pay cycles</h1>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {cycles.length}
          </span>
        </div>
        <SampleDataChip source={source} />
      </div>

      <div role="list" className="border-t border-border">
        {cycles.map((cycle) => {
          const active = cycle.id === selectedId
          return (
            <button
              type="button"
              role="listitem"
              key={cycle.id}
              onClick={() => onOpenCycle(cycle.id)}
              aria-current={active}
              className={cn(
                'flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors duration-150',
                active ? 'bg-foreground/[0.04]' : 'hover:bg-foreground/[0.02]',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{cycle.periodLabel}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-normal',
                    cycle.status === 'paid'
                      ? 'bg-prepared/10 text-prepared border-prepared/20'
                      : 'bg-decision/10 text-decision border-decision/20',
                  )}
                >
                  {cycle.status === 'paid' ? 'paid' : 'to be paid'}
                </Badge>
              </span>
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {cycle.payableDisplay}
                  {cycle.pendingRulingCount > 0 && (
                    <span className="text-decision ml-1" title="Excludes a pending-ruling line">
                      *
                    </span>
                  )}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {cycle.payDateLabel}
                </span>
              </span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {cycle.peopleCount} people
                {cycle.excludedCount > 0 && ` · ${cycle.excludedCount} excl.`}
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-meta px-4 pt-3 pb-4">
        * payable excludes lines gated by an open ruling.
      </p>
    </section>
  )
}
