'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import type { Client } from '@/lib/types'

const grid = 'grid-cols-[minmax(150px,1.2fr)_minmax(220px,2fr)_minmax(120px,1fr)_110px]'

export function ClientsHub({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <RecordsEmpty
        title="No clients on record for this entity."
        subline="A client exists here once a contract, invoice, or deposit names them — not before."
      />
    )
  }

  return (
    <section aria-label="Clients">
      <HubHeader title="Clients" count={clients.length} countNoun="client" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Client' },
          { label: 'Terms' },
          { label: 'Recent hours' },
          { label: 'Contracts' },
        ]}
      />
      <div role="list">
        {clients.map((client) => {
          const activeTerms = client.contracts
            .flatMap((c) => c.terms)
            .map((t) => t.summary)
            .slice(0, 1)
          const missingTerms = client.contracts.some((c) => c.status === 'missing_terms')
          const months = client.hoursByMonth
            ? Object.entries(client.hoursByMonth).slice(-2)
            : []
          return (
            <div
              role="listitem"
              key={client.id}
              className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
            >
              <RecordHover recordId={client.id}>
                <span className="text-title truncate font-medium text-foreground">
                  {client.name}
                </span>
              </RecordHover>
              <span className="text-meta truncate">
                {missingTerms && activeTerms.length === 0
                  ? 'no contract on file'
                  : (activeTerms[0] ?? '—')}
              </span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {months.length > 0
                  ? months.map(([m, h]) => `${m} ${h}`).join(' · ')
                  : '—'}
              </span>
              <span className="flex items-center gap-1.5">
                {missingTerms ? (
                  <Badge variant="outline" className="bg-held/10 text-held border-held/20 font-normal">
                    missing terms
                  </Badge>
                ) : (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {client.contracts.length} active
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
