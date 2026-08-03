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

/** One figure in the totals strip, rendered as a quiet stat card. */
function Stat({
  label,
  value,
  emphasis,
  accent,
}: {
  label: string
  value: string
  emphasis?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'font-mono tabular-nums',
          emphasis ? 'text-xl text-foreground' : 'text-sm',
          accent ? 'text-decision' : emphasis ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {value}
      </dd>
    </div>
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
    <section aria-label={`Pay cycle ${cycle.periodLabel}`} className="flex flex-col">
      {/* Frozen-sheet header */}
      <div className="flex flex-col gap-5 px-6 pt-5 pb-6">
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2 text-muted-foreground"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Clear selection
          </Button>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            {cycle.periodLabel}
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              {cycle.monthLabel.split(' ')[1]}
            </span>
          </h1>
          <p className="text-meta">
            {cycle.entityLabel} · {cycle.statusLabel} · {cycle.peopleCount} people
          </p>
          <Badge variant="outline" className="ml-auto bg-muted font-normal text-muted-foreground">
            frozen sheet
          </Badge>
        </div>

        {/* Totals strip — precomputed, receipts not code */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Payable" value={cycle.payableDisplay} emphasis />
          <Stat label="Vendor accrual" value={cycle.vendorAccrualDisplay} />
          <Stat label="Pay date" value={cycle.payDateLabel} />
          {cycle.pendingRulingCount > 0 && (
            <Stat label="Pending rulings" value={String(cycle.pendingRulingCount)} accent />
          )}
        </dl>

        {cycle.warnings.length > 0 && (
          <ul className="flex flex-col gap-1.5 rounded-lg border border-decision/20 bg-decision/[0.04] px-4 py-3">
            {cycle.warnings.map((w) => (
              <li key={w} className="text-decision font-mono text-xs leading-relaxed">
                ⚠ {w}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Line items — horizontally scrollable so the wide grid never breaks the pane */}
      <div className="border-t border-border">
        <div className="px-6 pt-4 pb-1">
          <h2 className="text-title font-medium text-foreground">Line items</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <TableHead
              gridClassName={grid}
              padX="px-6"
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
                      'grid items-start gap-3 border-b border-border px-6 py-3.5 transition-colors duration-150 hover:bg-foreground/[0.02]',
                      grid,
                      dimmed && 'opacity-55',
                      deferredIn && 'border-l-2 border-l-suggestion/60 bg-suggestion/[0.03]',
                      line.state === 'pending_ruling' && 'border-l-decision/60 bg-decision/[0.03]',
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
          </div>
        </div>
      </div>

      <p className="text-meta px-6 py-5">
        This sheet is frozen — amounts, rates, and rulings are recorded as they were at pay time.
        Corrections happen through new rulings, never edits.
      </p>
    </section>
  )
}
