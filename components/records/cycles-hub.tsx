'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { CycleDisplay } from '@/lib/fixtures/records/cycles'

const grid = 'grid-cols-[minmax(140px,1.2fr)_120px_120px_130px_130px_90px]'

export function CyclesHub({
  cycles,
  onOpenCycle,
}: {
  cycles: CycleDisplay[]
  onOpenCycle: (id: string) => void
}) {
  if (cycles.length === 0) {
    return (
      <RecordsEmpty
        title="No pay cycles on record for this entity."
        subline="Cycles are frozen sheets — every line traces to a timesheet, a rate card, and a ruling."
      />
    )
  }

  return (
    <section aria-label="Pay cycles">
      <HubHeader title="Pay cycles" count={cycles.length} countNoun="cycle" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Period' },
          { label: 'Status' },
          { label: 'Payable', align: 'right' },
          { label: 'Vendor accrual', align: 'right' },
          { label: 'Pay date' },
          { label: 'People' },
        ]}
      />
      <div role="list">
        {cycles.map((cycle) => (
          <div
            role="listitem"
            key={cycle.id}
            className={`group relative grid min-h-14 cursor-pointer items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
            onClick={() => onOpenCycle(cycle.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target === e.currentTarget) {
                e.preventDefault()
                onOpenCycle(cycle.id)
              }
            }}
            tabIndex={0}
            aria-label={`Open pay cycle ${cycle.periodLabel}`}
          >
            <span className="flex items-baseline gap-2" onClick={(e) => e.stopPropagation()}>
              <RecordHover recordId={cycle.id} onClick={() => onOpenCycle(cycle.id)}>
                <span className="text-title font-medium text-foreground">
                  {cycle.periodLabel}
                </span>
              </RecordHover>
              <span className="text-meta">{cycle.monthLabel.split(' ')[1]}</span>
            </span>
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
            <span className="text-right font-mono text-sm tabular-nums text-foreground">
              {cycle.payableDisplay}
              {cycle.pendingRulingCount > 0 && (
                <span className="text-decision ml-1" title="Excludes a pending-ruling line">
                  *
                </span>
              )}
            </span>
            <span className="text-right font-mono text-sm tabular-nums text-muted-foreground">
              {cycle.vendorAccrualDisplay}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {cycle.payDateLabel}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {cycle.peopleCount}
              {cycle.excludedCount > 0 && ` · ${cycle.excludedCount} excl.`}
            </span>
          </div>
        ))}
      </div>
      <p className="text-meta px-5 pt-3">
        * payable total excludes lines gated by an open ruling — see cycle detail.
      </p>
    </section>
  )
}
