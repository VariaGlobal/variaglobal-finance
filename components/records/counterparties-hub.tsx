'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import { entityName } from '@/lib/fixtures/workspace'
import { cn } from '@/lib/utils'
import type { Counterparty, CounterpartyRole } from '@/lib/types'

const grid =
  'grid-cols-[minmax(150px,1.4fr)_minmax(180px,1.6fr)_minmax(130px,1fr)_minmax(180px,1.6fr)]'

/** Role filter bar — "Clients" is simply the role=client view. */
const roleFilters: { label: string; role: CounterpartyRole | null }[] = [
  { label: 'All', role: null },
  { label: 'Clients', role: 'client' },
  { label: 'Customers', role: 'customer' },
  { label: 'Vendors', role: 'vendor' },
  { label: 'Partners', role: 'partner' },
  { label: 'Royalty sources', role: 'royalty source' },
  { label: 'Commission sources', role: 'commission source' },
]

export function RoleChip({ role }: { role: CounterpartyRole }) {
  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      {role}
    </Badge>
  )
}

export function CounterpartiesHub({
  counterparties,
  onOpenCounterparty,
}: {
  counterparties: Counterparty[]
  onOpenCounterparty: (counterpartyId: string) => void
}) {
  const [activeRole, setActiveRole] = useState<CounterpartyRole | null>(null)

  const visible = activeRole
    ? counterparties.filter((cp) => cp.roles.includes(activeRole))
    : counterparties

  if (counterparties.length === 0) {
    return (
      <RecordsEmpty
        title="No counterparties on record for this entity."
        subline="A counterparty exists here once money moves to or from them — not before."
      />
    )
  }

  return (
    <section aria-label="Counterparties">
      <HubHeader
        title="Counterparties"
        count={visible.length}
        countNoun="counterparty"
        countNounPlural="counterparties"
      />

      {/* Role filter bar */}
      <div
        role="tablist"
        aria-label="Filter by role"
        className="flex flex-wrap items-center gap-1.5 border-b border-border px-5 pb-3"
      >
        {roleFilters.map((f) => (
          <button
            key={f.label}
            role="tab"
            aria-selected={activeRole === f.role}
            onClick={() => setActiveRole(f.role)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs transition-colors duration-150',
              activeRole === f.role
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <RecordsEmpty
          title={`No counterparties with the ${activeRole} role.`}
          subline="Roles are earned by money movement — assign one by recording a relationship."
        />
      ) : (
        <>
          <TableHead
            gridClassName={grid}
            columns={[
              { label: 'Counterparty' },
              { label: 'Roles' },
              { label: 'Entity' },
              { label: 'Relationships' },
            ]}
          />
          <div role="list">
            {visible.map((cp) => {
              const heldBy = [...new Set(cp.relationships.map((r) => r.entity))]
              return (
                <div
                  role="listitem"
                  key={cp.id}
                  className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
                >
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <RecordHover recordId={cp.id} onClick={() => onOpenCounterparty(cp.id)}>
                      <span className="text-title truncate font-medium text-foreground">
                        {cp.name}
                      </span>
                    </RecordHover>
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
                  <span className="text-meta truncate">
                    {heldBy.map((e) => entityName(e)).join(' · ')}
                  </span>
                  <span className="text-meta truncate">
                    {cp.relationships.length > 0
                      ? cp.relationships.map((r) => r.streamType).join(' · ')
                      : 'no relationships on file'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
