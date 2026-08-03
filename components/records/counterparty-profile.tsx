'use client'

import { useState } from 'react'
import { ArrowLeftIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { RoleChip } from '@/components/records/counterparties-hub'
import { LifecycleChip, TableHead } from '@/components/records/records-bits'
import { entityName } from '@/lib/fixtures/workspace'
import { cn } from '@/lib/utils'
import { invoices } from '@/lib/fixtures/records/billing'
import type { Counterparty } from '@/lib/types'

const invoiceGrid = 'grid-cols-[110px_minmax(200px,2fr)_110px_100px]'

interface CounterpartyProfileProps {
  counterparty: Counterparty
  onBack: () => void
}

/**
 * Counterparty profile — header with every role chip and "also known as"
 * aliases, a Relationships section (one card per relationship: role, our
 * entity, stream type, status, effective dates), then Overview and
 * Contracts tabs.
 */
export function CounterpartyProfile({ counterparty, onBack }: CounterpartyProfileProps) {
  const [tab, setTab] = useState<'overview' | 'contracts'>('overview')

  const cpInvoices = invoices.filter((inv) => inv.clientId === counterparty.id)
  const months = counterparty.hoursByMonth ? Object.entries(counterparty.hoursByMonth) : []

  return (
    <section aria-label={`${counterparty.name} record`}>
      {/* Header: name · role chips · aliases */}
      <div className="border-b border-border px-5 pt-5 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground md:inline-flex"
        >
          <ArrowLeftIcon className="size-3.5" />
          Clear selection
        </button>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="text-lg font-medium tracking-tight text-foreground">
            {counterparty.name}
          </h1>
          <span className="flex flex-wrap items-center gap-1">
            {counterparty.roles.map((role) => (
              <RoleChip key={role} role={role} />
            ))}
          </span>
        </div>
        {counterparty.aliases && counterparty.aliases.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            also known as {counterparty.aliases.join(', ')}
          </p>
        )}
      </div>

      {/* Relationships — one card per money stream */}
      <div className="border-b border-border px-5 pt-5 pb-6">
        <h2 className="pb-3 text-sm font-medium text-foreground">Relationships</h2>
        {counterparty.relationships.length === 0 ? (
          <p className="text-meta">No relationships on file.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {counterparty.relationships.map((rel) => (
              <div key={rel.id} className="rounded-md border border-border p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <RoleChip role={rel.role} />
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-normal',
                      rel.status === 'active' &&
                        'bg-prepared/10 text-prepared border-prepared/20',
                      rel.status === 'dormant' && 'bg-held/10 text-held border-held/20',
                      rel.status === 'ended' && 'bg-muted text-muted-foreground border-border',
                    )}
                  >
                    {rel.status}
                  </Badge>
                </div>
                <dl className="mt-3 flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-3">
                    <dt className="w-20 shrink-0 text-xs text-muted-foreground">Our entity</dt>
                    <dd className="text-xs text-foreground">{entityName(rel.entity)}</dd>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <dt className="w-20 shrink-0 text-xs text-muted-foreground">Stream</dt>
                    <dd className="text-xs text-foreground">{rel.streamType}</dd>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <dt className="w-20 shrink-0 text-xs text-muted-foreground">Effective</dt>
                    <dd className="font-mono text-xs tabular-nums text-foreground">
                      {rel.effectiveFrom}
                      {rel.effectiveUntil ? ` – ${rel.effectiveUntil}` : ' – present'}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Counterparty record sections"
        className="flex items-center gap-5 border-b border-border px-5"
      >
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'contracts', label: 'Contracts' },
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
          <h2 className="px-5 pt-5 pb-3 text-sm font-medium text-foreground">Invoices</h2>
          {cpInvoices.length === 0 ? (
            <p className="text-meta px-5 pb-6">No invoices on record.</p>
          ) : (
            <>
              <TableHead
                gridClassName={invoiceGrid}
                columns={[
                  { label: 'Number' },
                  { label: 'Lines' },
                  { label: 'Total', align: 'right' },
                  { label: 'Status' },
                ]}
              />
              <div role="list">
                {cpInvoices.map((invoice) => (
                  <div
                    role="listitem"
                    key={invoice.id}
                    className={`grid min-h-11 items-center gap-3 border-b border-border px-5 py-2 transition-colors duration-150 hover:bg-foreground/[0.03] ${invoiceGrid}`}
                  >
                    <RecordHover recordId={invoice.id}>
                      <span className="font-mono text-xs tabular-nums text-foreground">
                        {invoice.number}
                      </span>
                    </RecordHover>
                    <span className="text-meta truncate">
                      {invoice.lines.map((l) => l.description).join(' · ')}
                    </span>
                    <span className="text-right font-mono text-xs tabular-nums text-foreground">
                      {invoice.total.display}
                    </span>
                    <LifecycleChip status={invoice.status} />
                  </div>
                ))}
              </div>
            </>
          )}

          {months.length > 0 && (
            <>
              <h2 className="px-5 pt-6 pb-3 text-sm font-medium text-foreground">
                Recent hours
              </h2>
              <div className="flex items-baseline gap-5 px-5 pb-8">
                {months.map(([month, hours]) => (
                  <span key={month} className="flex items-baseline gap-1.5">
                    <span className="text-xs text-muted-foreground">{month}</span>
                    <span className="font-mono text-sm tabular-nums text-foreground">
                      {hours}
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'contracts' && (
        <div className="pb-8">
          {counterparty.contracts.length === 0 ? (
            <p className="text-meta px-5 py-5">
              No contracts on file — this relationship is governed by platform terms.
            </p>
          ) : (
            counterparty.contracts.map((contract) => (
              <div key={contract.id} className="border-b border-border px-5 py-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-sm font-medium text-foreground">{contract.name}</h2>
                  <span className="text-meta">{contract.kind}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-normal',
                      contract.status === 'active' &&
                        'bg-prepared/10 text-prepared border-prepared/20',
                      contract.status === 'missing_terms' &&
                        'bg-held/10 text-held border-held/20',
                      contract.status === 'ended' &&
                        'bg-muted text-muted-foreground border-border',
                    )}
                  >
                    {contract.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {contract.terms.length === 0 ? (
                  <p className="text-meta mt-3">No terms on file — flagged in queue.</p>
                ) : (
                  <dl className="mt-3 flex flex-col gap-1.5">
                    {contract.terms.map((terms) => (
                      <div key={terms.id} className="flex items-baseline gap-3">
                        <dt className="w-20 shrink-0 text-xs text-muted-foreground">Terms</dt>
                        <dd className="min-w-0">
                          <span className="font-mono text-xs tabular-nums text-foreground">
                            {terms.summary}
                          </span>
                          <span className="ml-1.5 text-[11px] text-muted-foreground/70">
                            since {terms.effectiveFrom}
                          </span>
                        </dd>
                      </div>
                    ))}
                    {contract.rules.map((rule) => (
                      <div key={rule.id} className="flex items-baseline gap-3">
                        <dt className="w-20 shrink-0 text-xs text-muted-foreground">Rule</dt>
                        <dd className="min-w-0">
                          <span className="text-xs text-foreground">{rule.label}</span>
                          {rule.activeUntil && (
                            <span className="ml-1.5 text-[11px] text-muted-foreground/70">
                              until {rule.activeUntil}
                            </span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
