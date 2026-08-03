'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import {
  HubHeader,
  MatchedChip,
  RecordsEmpty,
  TableHead,
  TableSkeleton,
} from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import { useTransactions, type TransactionView } from '@/lib/records-api/resources'

const grid = 'grid-cols-[70px_minmax(220px,2.2fr)_120px_minmax(140px,1.1fr)_150px_90px]'

/** owner_draw → "owner draw"; artist_royalty_payout → "artist royalty payout" */
function categoryLabel(category: string) {
  return category.replace(/_/g, ' ')
}

const categoryTone: Record<string, string> = {
  owner_draw: 'bg-held/10 text-held border-held/20',
  artist_royalty_payout: 'bg-suggestion/10 text-suggestion border-suggestion/20',
}

function CategoryChip({ category }: { category?: string }) {
  if (!category) return <span className="text-meta">—</span>
  return (
    <Badge
      variant="outline"
      className={cn('font-normal', categoryTone[category] ?? 'text-muted-foreground')}
    >
      {categoryLabel(category)}
    </Badge>
  )
}

/**
 * Banking hub — real Mercury rows from the live API. Amounts arrive
 * display-ready (sign included) and category drives the chip. Falls back to
 * bundled sample rows when the endpoint is unavailable, badged accordingly.
 */
export function BankingHub({ entity }: { entity?: string }) {
  const { data: transactions, source, loading } = useTransactions(entity)

  if (!loading && transactions.length === 0) {
    return (
      <RecordsEmpty
        title="No bank activity on record for this entity."
        subline="Upload a Mercury statement and every row lands here — matched or waiting to be."
      />
    )
  }

  return (
    <section aria-label="Banking">
      <HubHeader
        title="Banking"
        count={transactions.length}
        countNoun="transaction"
        source={source}
      />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Posted' },
          { label: 'Counterparty' },
          { label: 'Amount', align: 'right' },
          { label: 'Account' },
          { label: 'Category' },
          { label: 'Matched' },
        ]}
      />
      {loading ? (
        <TableSkeleton gridClassName={grid} cols={6} />
      ) : (
        <div role="list">
          {transactions.map((txn: TransactionView) => (
            <div
              role="listitem"
              key={txn.id}
              className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {txn.postedAt}
              </span>
              {txn.matched ? (
                <RecordHover recordId={txn.id} className="min-w-0">
                  <span className="text-title truncate text-foreground">{txn.description}</span>
                </RecordHover>
              ) : (
                <span className="text-title truncate text-foreground">{txn.description}</span>
              )}
              <span
                className={cn(
                  'text-right font-mono text-sm tabular-nums',
                  txn.direction === 'credit' ? 'text-prepared' : 'text-foreground',
                )}
              >
                {txn.amountDisplay}
              </span>
              <span className="text-meta truncate">{txn.account}</span>
              <span className="min-w-0">
                <CategoryChip category={txn.category} />
              </span>
              <MatchedChip matched={txn.matched} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
