'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import {
  HubBody,
  HubCanvas,
  MatchedChip,
  PageHeader,
  RecordsEmpty,
  TableHead,
  TableSkeleton,
  moneyHubSubtitles,
  rowClass,
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
export function BankingHub({
  entity,
  action,
}: {
  entity?: string
  action?: React.ReactNode
}) {
  const { data: transactions, source, loading } = useTransactions(entity)
  const isEmpty = !loading && transactions.length === 0

  return (
    <HubCanvas>
      <section aria-label="Banking" className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Banking"
          eyebrow={`Money · ${moneyHubSubtitles.banking}`}
          count={transactions.length}
          countNoun="transaction"
          description="Mercury activity for this entity — matched to records or waiting to be."
          source={loading || isEmpty ? undefined : source}
          action={action}
        />
        {isEmpty ? (
          <RecordsEmpty
            title="No bank activity on record for this entity."
            subline="Upload a Mercury statement and every row lands here — matched or waiting to be. Try switching entity in the top bar."
          />
        ) : (
        <HubBody>
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
                <div role="listitem" key={txn.id} className={rowClass(grid, txn.matched)}>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {txn.postedAt}
                  </span>
                  {txn.matched ? (
                    <RecordHover recordId={txn.id} className="min-w-0">
                      <span className="text-title truncate text-foreground">
                        {txn.description}
                      </span>
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
        </HubBody>
        )}
      </section>
    </HubCanvas>
  )
}
