'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RecordsEmpty, SampleDataChip } from '@/components/records/records-bits'
import { entityName } from '@/lib/fixtures/workspace'
import { cn } from '@/lib/utils'
import type { DataSource } from '@/lib/records-api/types'
import type { Counterparty, CounterpartyRole } from '@/lib/types'

/** Role filter bar — "Clients" is simply the role=client view. */
const roleFilters: { label: string; role: CounterpartyRole | null }[] = [
  { label: 'All', role: null },
  { label: 'Clients', role: 'client' },
  { label: 'Customers', role: 'customer' },
  { label: 'Vendors', role: 'vendor' },
  { label: 'Partners', role: 'partner' },
  { label: 'Royalty', role: 'royalty source' },
  { label: 'Commission', role: 'commission source' },
]

export function RoleChip({ role }: { role: CounterpartyRole }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      {role}
    </Badge>
  )
}

/**
 * Counterparties list rail. Compact, selectable rows feed the detail pane;
 * the role filter sits in the header. Sample-data chip appears whenever the
 * list is fixtures rather than the live registry.
 */
export function CounterpartiesHub({
  counterparties,
  selectedId,
  onOpenCounterparty,
  source = 'live',
}: {
  counterparties: Counterparty[]
  selectedId: string | null
  onOpenCounterparty: (counterpartyId: string) => void
  source?: DataSource
}) {
  const [activeRole, setActiveRole] = useState<CounterpartyRole | null>(null)

  const visible = activeRole
    ? counterparties.filter((cp) => cp.roles.includes(activeRole))
    : counterparties

  if (counterparties.length === 0) {
    return (
      <RecordsEmpty
        title="No counterparties on record."
        subline="A counterparty exists here once money moves to or from them — not before."
      />
    )
  }

  return (
    <section aria-label="Counterparties" className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 pt-5 pb-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-medium tracking-tight text-foreground">Counterparties</h1>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {visible.length}
          </span>
        </div>
        <SampleDataChip source={source} />
      </div>

      {/* Role filter */}
      <div
        role="tablist"
        aria-label="Filter by role"
        className="flex flex-wrap items-center gap-1 border-b border-border px-4 pb-3"
      >
        {roleFilters.map((f) => (
          <button
            key={f.label}
            role="tab"
            aria-selected={activeRole === f.role}
            onClick={() => setActiveRole(f.role)}
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-150',
              activeRole === f.role
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-meta px-4 py-6">No counterparties with the {activeRole} role.</p>
      ) : (
        <div role="list">
          {visible.map((cp) => {
            const heldBy = [...new Set(cp.relationships.map((r) => r.entity))]
            const active = cp.id === selectedId
            return (
              <button
                type="button"
                role="listitem"
                key={cp.id}
                onClick={() => onOpenCounterparty(cp.id)}
                aria-current={active}
                className={cn(
                  'flex w-full flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors duration-150',
                  active
                    ? 'bg-foreground/[0.04]'
                    : 'hover:bg-foreground/[0.02]',
                )}
              >
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="truncate text-sm font-medium text-foreground">{cp.name}</span>
                  {cp.aliases && cp.aliases.length > 0 && (
                    <span className="truncate text-[11px] text-muted-foreground/70">
                      aka {cp.aliases.join(', ')}
                    </span>
                  )}
                </span>
                <span className="flex flex-wrap items-center gap-1">
                  {cp.roles.map((role) => (
                    <RoleChip key={role} role={role} />
                  ))}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {heldBy.map((e) => entityName(e)).join(' · ')}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
