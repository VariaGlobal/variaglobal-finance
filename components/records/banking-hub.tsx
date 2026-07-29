'use client'

import { HubHeader, MatchedChip, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { BankTransaction } from '@/lib/types'

const grid = 'grid-cols-[70px_minmax(240px,2.4fr)_120px_minmax(150px,1.2fr)_100px]'

export function BankingHub({ transactions }: { transactions: BankTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <RecordsEmpty
        title="No bank activity on record for this entity."
        subline="Upload a Mercury statement and every row lands here — matched or waiting to be."
      />
    )
  }

  return (
    <section aria-label="Banking">
      <HubHeader title="Banking" count={transactions.length} countNoun="transaction" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Posted' },
          { label: 'Counterparty' },
          { label: 'Amount', align: 'right' },
          { label: 'Account' },
          { label: 'Matched' },
        ]}
      />
      <div role="list">
        {transactions.map((txn) => (
          <div
            role="listitem"
            key={txn.id}
            className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
          >
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {txn.postedAt}
            </span>
            <span className="text-title truncate text-foreground">{txn.description}</span>
            <span
              className={cn(
                'text-right font-mono text-sm tabular-nums',
                txn.direction === 'credit' ? 'text-prepared' : 'text-foreground',
              )}
            >
              {txn.amount.display}
            </span>
            <span className="text-meta truncate">{txn.account}</span>
            <MatchedChip matched={txn.matched} />
          </div>
        ))}
      </div>
    </section>
  )
}
