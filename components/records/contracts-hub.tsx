'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { Client, Contract } from '@/lib/types'

const grid = 'grid-cols-[minmax(170px,1.4fr)_minmax(120px,1fr)_minmax(220px,2fr)_minmax(160px,1.4fr)_100px]'

interface ContractRow {
  contract: Contract
  clientName: string
  clientId: string
}

export function ContractsHub({ clients }: { clients: Client[] }) {
  const rows: ContractRow[] = clients.flatMap((client) =>
    client.contracts.map((contract) => ({
      contract,
      clientName: client.name,
      clientId: client.id,
    })),
  )

  if (rows.length === 0) {
    return (
      <RecordsEmpty
        title="No contracts on record."
        subline="Terms, rules, and effective dates live here — every invoice line traces back to one."
      />
    )
  }

  return (
    <section aria-label="Contracts">
      <HubHeader title="Contracts" count={rows.length} countNoun="contract" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Contract' },
          { label: 'Client' },
          { label: 'Terms' },
          { label: 'Rules' },
          { label: 'Status' },
        ]}
      />
      <div role="list">
        {rows.map(({ contract, clientName, clientId }) => {
          const terms = contract.terms[contract.terms.length - 1]
          return (
            <div
              role="listitem"
              key={contract.id}
              className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
            >
              <span className="text-title truncate font-medium text-foreground">
                {contract.name}
                <span className="text-meta ml-2 font-normal">{contract.kind}</span>
              </span>
              <RecordHover recordId={clientId}>
                <span className="text-meta truncate">{clientName}</span>
              </RecordHover>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {terms ? terms.summary : 'no terms on file'}
              </span>
              <span className="text-meta truncate">
                {contract.rules.length > 0
                  ? contract.rules.map((r) => r.label).join(' · ')
                  : '—'}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  'font-normal',
                  contract.status === 'active' &&
                    'bg-prepared/10 text-prepared border-prepared/20',
                  contract.status === 'missing_terms' &&
                    'bg-held/10 text-held border-held/20',
                  contract.status === 'ended' && 'bg-muted text-muted-foreground border-border',
                )}
              >
                {contract.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          )
        })}
      </div>
    </section>
  )
}
