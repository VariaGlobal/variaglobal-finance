'use client'

import { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RecordsEmpty } from '@/components/records/records-bits'
import { entityName } from '@/lib/fixtures/workspace'
import { cn } from '@/lib/utils'
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
 * a sticky role filter sits at the top of the rail. The title, count, and
 * sample-data chip live in the shared PageHeader above the rail.
 */
export function CounterpartiesHub({
  counterparties,
  selectedId,
  onOpenCounterparty,
}: {
  counterparties: Counterparty[]
  selectedId: string | null
  onOpenCounterparty: (counterpartyId: string) => void
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
      {/* Sticky role filter */}
      <div
        role="tablist"
        aria-label="Filter by role"
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-card/95 px-3 pb-3 backdrop-blur-sm"
      >
        {roleFilters.map((f) => (
          <button
            key={f.label}
            role="tab"
            aria-selected={activeRole === f.role}
            onClick={() => setActiveRole(f.role)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-150',
              activeRole === f.role
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="text-meta px-4 py-8 text-center">
          No counterparties with the {activeRole} role.
        </p>
      ) : (
        <div role="list" className="px-2 pt-2">
          {visible.map((cp, i) => {
            const heldBy = [...new Set(cp.relationships.map((r) => r.entity))]
            const active = cp.id === selectedId
            return (
              <button
                type="button"
                role="listitem"
                key={cp.id}
                onClick={() => onOpenCounterparty(cp.id)}
                aria-current={active}
                style={{ animationDelay: `${Math.min(i * 24, 240)}ms` }}
                className={cn(
                  'animate-row-in group relative flex w-full items-start gap-2 rounded-lg px-3 py-3 text-left transition-colors duration-150',
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
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
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
                </span>
                <ChevronRightIcon
                  className={cn(
                    'mt-0.5 size-4 shrink-0 text-muted-foreground/40 transition-all duration-150',
                    active
                      ? 'translate-x-0 text-muted-foreground opacity-100'
                      : 'opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  )}
                />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
