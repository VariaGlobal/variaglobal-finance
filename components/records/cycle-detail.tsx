'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RecordHover } from '@/components/records/record-hover'
import { TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { CycleDisplay, CycleLineDisplay } from '@/lib/fixtures/records/cycles'

const grid = 'grid-cols-[minmax(150px,1.3fr)_80px_90px_110px_110px_minmax(220px,2fr)]'

function LineStateChip({ line }: { line: CycleLineDisplay }) {
  if (line.state === 'payable') return null
  const styles: Record<string, string> = {
    excluded: 'bg-muted text-muted-foreground border-border',
    deferred_out: 'bg-held/10 text-held border-held/20',
    deferred_in: 'bg-suggestion/10 text-suggestion border-suggestion/20',
    pending_ruling: 'bg-decision/10 text-decision border-decision/20',
  }
  const labels: Record<string, string> = {
    excluded: 'excluded',
    deferred_out: 'deferred out',
    deferred_in: 'deferred in',
    pending_ruling: 'pending ruling',
  }
  return (
    <Badge variant="outline" className={cn('font-normal', styles[line.state])}>
      {labels[line.state]}
    </Badge>
  )
}

/**
 * Frozen sheet — a paid or prepared cycle rendered as an immutable record.
 * Excluded and deferred-in lines are visually distinct; person names carry
 * hover summaries and link to People.
 */
export function CycleDetail({
  cycle,
  onBack,
  onOpenPerson,
}: {
  cycle: CycleDisplay
  onBack: () => void
  onOpenPerson: (personId: string) => void
}) {
  return (
    <section aria-label={`Pay cycle ${cycle.periodLabel}`}>
      {/* Frozen-sheet header */}
      <div className="flex flex-col gap-4 px-5 pt-6 pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 text-muted-foreground"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Pay cycles
          </Button>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            {cycle.periodLabel}
            <span className="ml-2 font-normal text-muted-foreground">
              {cycle.monthLabel.split(' ')[1]}
            </span>
          </h1>
          <p className="text-meta">
            {cycle.entityLabel} · {cycle.statusLabel} · {cycle.peopleCount} people
          </p>
          <Badge
            variant="outline"
            className="ml-auto bg-muted font-normal text-muted-foreground"
          >
            frozen sheet
          </Badge>
        </div>

        {/* Totals strip — precomputed, receipts not code */}
        <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-y border-border py-3">
          <div className="flex items-baseline gap-2">
            <dt className="text-xs text-muted-foreground">Payable</dt>
            <dd className="font-mono text-base tabular-nums text-foreground">
              {cycle.payableDisplay}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-xs text-muted-foreground">Vendor accrual</dt>
            <dd className="font-mono text-sm tabular-nums text-muted-foreground">
              {cycle.vendorAccrualDisplay}
            </dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-xs text-muted-foreground">Pay date</dt>
            <dd className="font-mono text-sm tabular-nums text-muted-foreground">
              {cycle.payDateLabel}
            </dd>
          </div>
          {cycle.pendingRulingCount > 0 && (
            <div className="flex items-baseline gap-2">
              <dt className="text-xs text-muted-foreground">Pending rulings</dt>
              <dd className="text-decision font-mono text-sm tabular-nums">
                {cycle.pendingRulingCount}
              </dd>
            </div>
          )}
        </dl>

        {cycle.warnings.length > 0 && (
          <ul className="flex flex-col gap-1">
            {cycle.warnings.map((w) => (
              <li key={w} className="text-decision font-mono text-xs leading-relaxed">
                ⚠ {w}
              </li>
            ))}
          </ul>
        )}
      </div>

      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Person' },
          { label: 'Hours', align: 'right' },
          { label: 'Rate', align: 'right' },
          { label: 'Amount', align: 'right' },
          { label: 'Origin period' },
          { label: 'Notes' },
        ]}
      />
      <div role="list">
        {cycle.lines.map((line) => {
          const dimmed = line.state === 'excluded' || line.state === 'deferred_out'
          const deferredIn = line.state === 'deferred_in' || line.state === 'pending_ruling'
          return (
            <div
              role="listitem"
              key={line.id}
              className={cn(
                'grid items-start gap-3 border-b border-border px-5 py-3 transition-colors duration-150 hover:bg-foreground/[0.02]',
                grid,
                dimmed && 'opacity-55',
                deferredIn && 'border-l-2 border-l-suggestion/60 bg-suggestion/[0.03]',
                line.state === 'pending_ruling' &&
                  'border-l-decision/60 bg-decision/[0.03]',
              )}
            >
              <span className="flex flex-wrap items-center gap-2">
                <RecordHover
                  recordId={line.personId}
                  onClick={() => onOpenPerson(line.personId)}
                >
                  <span className="text-title font-medium text-foreground">
                    {line.personName}
                  </span>
                </RecordHover>
                <LineStateChip line={line} />
              </span>
              <span className="text-right font-mono text-sm tabular-nums text-foreground">
                {line.hoursDisplay}
              </span>
              <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                {line.rateDisplay}
              </span>
              <span
                className={cn(
                  'text-right font-mono text-sm tabular-nums',
                  line.state === 'payable' ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {line.amountDisplay}
              </span>
              <span
                className={cn(
                  'font-mono text-xs tabular-nums',
                  line.originIsForeign ? 'text-decision' : 'text-muted-foreground',
                )}
              >
                {line.originPeriodLabel}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-mono text-xs tabular-nums text-muted-foreground/80">
                  {line.trace}
                </span>
                {line.stateLabel && (
                  <span className="text-meta leading-relaxed">{line.stateLabel}</span>
                )}
                {line.notes.map((note) => (
                  <span key={note} className="text-meta leading-relaxed text-pretty">
                    {note}
                  </span>
                ))}
                {line.rulingOptions && (
                  <span className="mt-1 flex flex-col gap-1">
                    {line.rulingOptions.map((opt) => (
                      <span
                        key={opt.label}
                        className="text-decision inline-flex items-baseline gap-2 self-start rounded border border-decision/25 px-2 py-0.5 font-mono text-xs tabular-nums"
                      >
                        {opt.label}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-meta px-5 py-4">
        This sheet is frozen — amounts, rates, and rulings are recorded as they were at
        pay time. Corrections happen through new rulings, never edits.
      </p>
    </section>
  )
}
