'use client'

import { Badge } from '@/components/ui/badge'
import { RecordsEmpty } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { CycleDisplay } from '@/lib/fixtures/records/cycles'

/**
 * Pay cycles list rail. Each row surfaces the payable total, status, and pay
 * date; selection opens the frozen sheet in the detail pane. Title, count,
 * and sample-data chip live in the shared PageHeader above the rail.
 */
export function CyclesHub({
  cycles,
  selectedId,
  onOpenCycle,
}: {
  cycles: CycleDisplay[]
  selectedId: string | null
  onOpenCycle: (id: string) => void
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
      <div role="list" className="flex flex-col gap-1 px-2 pt-2">
        {cycles.map((cycle, i) => {
          const active = cycle.id === selectedId
          return (
            <button
              type="button"
              role="listitem"
              key={cycle.id}
              onClick={() => onOpenCycle(cycle.id)}
              aria-current={active}
              style={{ animationDelay: `${Math.min(i * 24, 240)}ms` }}
              className={cn(
                'animate-row-in group relative flex w-full flex-col gap-2 rounded-lg px-3 py-3 text-left transition-colors duration-150',
                active ? 'bg-foreground/[0.05]' : 'hover:bg-foreground/[0.03]',
              )}
            >
              {/* selection accent */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-y-2 left-0 w-0.5 rounded-full bg-foreground transition-opacity duration-150',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{cycle.periodLabel}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-normal',
                    cycle.status === 'paid'
                      ? 'border-prepared/20 bg-prepared/10 text-prepared'
                      : 'border-decision/20 bg-decision/10 text-decision',
                  )}
                >
                  {cycle.status === 'paid' ? 'paid' : 'to be paid'}
                </Badge>
              </span>
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-base tabular-nums text-foreground">
                  {cycle.payableDisplay}
                  {cycle.pendingRulingCount > 0 && (
                    <span className="ml-1 text-decision" title="Excludes a pending-ruling line">
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
      <p className="text-meta px-4 pt-4 pb-4">* payable excludes lines gated by an open ruling.</p>
    </section>
  )
}
