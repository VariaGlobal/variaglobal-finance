'use client'

import { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { RecordHover } from '@/components/records/record-hover'
import { HubCanvas, StatusChip, TableHead } from '@/components/records/records-bits'
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
  /** Jump to the counterparty this person is paid via (resolved by name). */
  onOpenCounterpartyByName?: (name: string) => void
  /** Whether that counterparty actually exists as a record (to decide link vs text). */
  canResolveCounterparty?: (name: string) => boolean
}

/**
 * Person profile — Overview (cycle lines, compliance) and Compensation
 * (rate history with effective dates, routing, adjustments). Rendered
 * full-width inside the framed canvas, replacing the People list.
 */
export function PersonProfile({
  person,
  onBack,
  onOpenCycle,
  onOpenCounterpartyByName,
  canResolveCounterparty,
}: PersonProfileProps) {
  const [tab, setTab] = useState<'overview' | 'compensation'>('overview')

  const routedVia = person.routing.mode === 'routed' ? person.routing.routedVia : undefined
  const routedViaLinkable = Boolean(
    routedVia && onOpenCounterpartyByName && (canResolveCounterparty?.(routedVia) ?? false),
  )

  const lines = cycles
    .flatMap((cycle) =>
      cycle.lines.filter((l) => l.personId === person.id).map((l) => ({ cycle, line: l })),
    )
    .reverse()
  const adjustments = compAdjustments[person.id] ?? []
  const rateHistory = [...person.rateHistory].reverse() // newest first

  return (
    <HubCanvas className="p-0">
      <section aria-label={`${person.name} record`} className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-border px-6 pt-5 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            People
          </button>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">{person.name}</h1>
            <span className="text-meta">{person.role}</span>
            {routedVia ? (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                routed ·{' '}
                {routedViaLinkable ? (
                  <button
                    type="button"
                    onClick={() => onOpenCounterpartyByName!(routedVia)}
                    className="rounded-sm underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                    title={`Open ${routedVia} in Counterparties`}
                  >
                    {routedVia}
                  </button>
                ) : (
                  routedVia
                )}
              </span>
            ) : (
              <span className="font-mono text-xs tabular-nums text-muted-foreground">direct</span>
            )}
          </div>
        </div>

        {/* Body scrolls beneath a sticky tab bar */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            role="tablist"
            aria-label="Person record sections"
            className="sticky top-0 z-10 flex items-center gap-5 border-b border-border bg-card/95 px-6 backdrop-blur-sm"
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
                  '-mb-px border-b py-3 text-sm transition-colors duration-150',
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
            <div className="animate-detail-in">
              <h2 className="text-title px-6 pt-6 pb-3 font-medium text-foreground">Cycle lines</h2>
              {lines.length === 0 ? (
                <p className="text-meta px-6 pb-6">No cycle lines on record.</p>
              ) : (
                <>
                  <TableHead
                    gridClassName={lineGrid}
                    padX="px-6"
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
                        className={`grid min-h-12 items-center gap-3 border-b border-border px-6 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${lineGrid}`}
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
                        <span className="text-meta truncate">{line.stateLabel ?? line.state}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="text-title px-6 pt-7 pb-3 font-medium text-foreground">Compliance</h2>
              <div className="flex flex-wrap items-center gap-2 px-6 pb-8">
                {person.complianceDocs.map((doc) => (
                  <StatusChip key={doc.kind} tone={doc.status === 'signed' ? 'positive' : 'attention'}>
                    {doc.kind} {doc.status}
                  </StatusChip>
                ))}
              </div>
            </div>
          )}

          {tab === 'compensation' && (
            <div className="animate-detail-in">
              <h2 className="text-title px-6 pt-6 pb-3 font-medium text-foreground">Rate history</h2>
              <TableHead
                gridClassName={rateGrid}
                padX="px-6"
                columns={[
                  { label: 'Rate', align: 'right' },
                  { label: 'Effective' },
                  { label: 'Status' },
                ]}
              />
              <div role="list">
                {rateHistory.map((rate, i) => (
                  <div
                    role="listitem"
                    key={rate.id}
                    className={`grid min-h-12 items-center gap-3 border-b border-border px-6 py-2.5 ${rateGrid}`}
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

              <h2 className="text-title px-6 pt-7 pb-3 font-medium text-foreground">Routing</h2>
              <p className="px-6 pb-2 font-mono text-xs tabular-nums text-muted-foreground">
                {routedVia ? (
                  <>
                    Paid via{' '}
                    {routedViaLinkable ? (
                      <button
                        type="button"
                        onClick={() => onOpenCounterpartyByName!(routedVia)}
                        className="rounded-sm underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        title={`Open ${routedVia} in Counterparties`}
                      >
                        {routedVia}
                      </button>
                    ) : (
                      routedVia
                    )}{' '}
                    · bill rate {person.routing.clientRateDisplay ?? '—'} (vendor-side)
                  </>
                ) : (
                  'Paid directly · Mercury ACH'
                )}
              </p>

              <h2 className="text-title px-6 pt-7 pb-3 font-medium text-foreground">Adjustments</h2>
              {adjustments.length === 0 ? (
                <p className="text-meta px-6 pb-8">No adjustments on record.</p>
              ) : (
                <div role="list" className="pb-8">
                  {adjustments.map((adj) => (
                    <div
                      role="listitem"
                      key={adj.label}
                      className="flex min-h-12 items-baseline justify-between gap-3 border-b border-border px-6 py-2.5"
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
        </div>
      </section>
    </HubCanvas>
  )
}
