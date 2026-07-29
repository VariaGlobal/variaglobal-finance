'use client'

import { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import { compAdjustments } from '@/lib/fixtures/records/people'
import { cycles } from '@/lib/fixtures/records/cycles'
import type { Person } from '@/lib/types'

const rateGrid = 'grid-cols-[110px_minmax(160px,1.4fr)_minmax(140px,1fr)]'
const lineGrid = 'grid-cols-[110px_90px_100px_110px_minmax(160px,1.4fr)]'

interface PersonProfileProps {
  person: Person
  onBack: () => void
  onOpenCycle: (cycleId: string) => void
}

/**
 * Person profile — Overview (cycle lines, compliance) and Compensation
 * (rate history with effective dates, routing, adjustments).
 */
export function PersonProfile({ person, onBack, onOpenCycle }: PersonProfileProps) {
  const [tab, setTab] = useState<'overview' | 'compensation'>('overview')

  const lines = cycles
    .flatMap((cycle) =>
      cycle.lines
        .filter((l) => l.personId === person.id)
        .map((l) => ({ cycle, line: l })),
    )
    .reverse()
  const adjustments = compAdjustments[person.id] ?? []
  const rateHistory = [...person.rateHistory].reverse() // newest first

  return (
    <section aria-label={`${person.name} record`}>
      {/* Header */}
      <div className="border-b border-border px-5 pt-5 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          People
        </button>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-lg font-medium tracking-tight text-foreground">{person.name}</h1>
          <span className="text-meta">{person.role}</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {person.routing.mode === 'routed'
              ? `routed · ${person.routing.routedVia}`
              : 'direct'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Person record sections"
        className="flex items-center gap-5 border-b border-border px-5"
      >
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'compensation', label: 'Compensation' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b py-2.5 text-sm transition-colors duration-150',
              tab === t.id
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <h2 className="px-5 pt-5 pb-3 text-sm font-medium text-foreground">Cycle lines</h2>
          {lines.length === 0 ? (
            <p className="text-meta px-5 pb-6">No cycle lines on record.</p>
          ) : (
            <>
              <TableHead
                gridClassName={lineGrid}
                columns={[
                  { label: 'Cycle' },
                  { label: 'Hours', align: 'right' },
                  { label: 'Rate', align: 'right' },
                  { label: 'Amount', align: 'right' },
                  { label: 'State' },
                ]}
              />
              <div role="list">
                {lines.map(({ cycle, line }) => (
                  <div
                    role="listitem"
                    key={line.id}
                    className={`grid min-h-11 items-center gap-3 border-b border-border px-5 py-2 transition-colors duration-150 hover:bg-foreground/[0.03] ${lineGrid}`}
                  >
                    <RecordHover recordId={cycle.id} onClick={() => onOpenCycle(cycle.id)}>
                      <span className="font-mono text-xs tabular-nums text-foreground">
                        {cycle.periodLabel}
                      </span>
                    </RecordHover>
                    <span className="text-right font-mono text-xs tabular-nums text-foreground">
                      {line.hoursDisplay}
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {line.rateDisplay}
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums text-foreground">
                      {line.amountDisplay}
                    </span>
                    <span className="text-meta truncate">
                      {line.stateLabel ?? line.state}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="px-5 pt-6 pb-3 text-sm font-medium text-foreground">Compliance</h2>
          <div className="flex items-center gap-2 px-5 pb-8">
            {person.complianceDocs.map((doc) => (
              <Badge
                key={doc.kind}
                variant="outline"
                className={cn(
                  'font-normal',
                  doc.status === 'signed'
                    ? 'bg-prepared/10 text-prepared border-prepared/20'
                    : 'bg-held/10 text-held border-held/20',
                )}
              >
                {doc.kind} {doc.status}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {tab === 'compensation' && (
        <div>
          <h2 className="px-5 pt-5 pb-3 text-sm font-medium text-foreground">Rate history</h2>
          <TableHead
            gridClassName={rateGrid}
            columns={[{ label: 'Rate', align: 'right' }, { label: 'Effective' }, { label: 'Status' }]}
          />
          <div role="list">
            {rateHistory.map((rate, i) => (
              <div
                role="listitem"
                key={rate.id}
                className={`grid min-h-11 items-center gap-3 border-b border-border px-5 py-2 ${rateGrid}`}
              >
                <span
                  className={cn(
                    'text-right font-mono text-sm tabular-nums',
                    i === 0 ? 'text-foreground' : 'text-muted-foreground line-through',
                  )}
                >
                  {rate.rateDisplay}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {rate.effectiveFrom}
                  {rate.effectiveTo ? ` – ${rate.effectiveTo}` : ' – present'}
                </span>
                <span className="text-meta">{i === 0 ? 'current' : 'superseded'}</span>
              </div>
            ))}
          </div>

          <h2 className="px-5 pt-6 pb-3 text-sm font-medium text-foreground">Routing</h2>
          <p className="px-5 pb-2 font-mono text-xs tabular-nums text-muted-foreground">
            {person.routing.mode === 'routed'
              ? `Paid via ${person.routing.routedVia} · bill rate ${person.routing.clientRateDisplay ?? '—'} (vendor-side)`
              : 'Paid directly · Mercury ACH'}
          </p>

          <h2 className="px-5 pt-6 pb-3 text-sm font-medium text-foreground">Adjustments</h2>
          {adjustments.length === 0 ? (
            <p className="text-meta px-5 pb-8">No adjustments on record.</p>
          ) : (
            <div role="list" className="pb-8">
              {adjustments.map((adj) => (
                <div
                  role="listitem"
                  key={adj.label}
                  className="flex min-h-11 items-baseline justify-between gap-3 border-b border-border px-5 py-2"
                >
                  <span className="text-meta min-w-0 truncate">{adj.label}</span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="font-mono text-xs tabular-nums text-foreground">
                      {adj.amountDisplay}
                    </span>
                    <span className="text-[11px] text-muted-foreground/70">{adj.asOf}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
