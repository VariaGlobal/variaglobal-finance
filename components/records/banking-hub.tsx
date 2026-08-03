'use client'

import { useState } from 'react'
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
  const [hideInternal, setHideInternal] = useState(true)

  // 194+ of the rows are moves between our own accounts; they bury real
  // activity, so we hide them by default and surface a count instead.
  const internalCount = transactions.filter((t) => t.category === 'internal_transfer').length
  const visible = hideInternal
    ? transactions.filter((t) => t.category !== 'internal_transfer')
    : transactions

  const isEmpty = !loading && transactions.length === 0
  const emptyAfterFilter = !loading && transactions.length > 0 && visible.length === 0

  return (
    <HubCanvas>
      <section aria-label="Banking" className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Banking"
          eyebrow={`Money · ${moneyHubSubtitles.banking}`}
          count={visible.length}
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
        <>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 md:px-7">
          <button
            type="button"
            role="switch"
            aria-checked={hideInternal}
            onClick={() => setHideInternal((v) => !v)}
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <span
              className={cn(
                'relative h-4 w-7 rounded-full transition-colors duration-150',
                hideInternal ? 'bg-foreground/70' : 'bg-border',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 size-3 rounded-full bg-background transition-all duration-150',
                  hideInternal ? 'left-3.5' : 'left-0.5',
                )}
              />
            </span>
            Hide internal transfers
          </button>
          {hideInternal && internalCount > 0 && (
            <span className="inline-flex h-6 items-center rounded-full border border-border px-2.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              +{internalCount} internal hidden
            </span>
          )}
        </div>
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
          ) : emptyAfterFilter ? (
            <p className="text-meta px-5 py-6 md:px-7">
              Every row for this entity is an internal transfer.{' '}
              <button
                type="button"
                onClick={() => setHideInternal(false)}
                className="underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-foreground"
              >
                Show {internalCount} internal {internalCount === 1 ? 'transfer' : 'transfers'}
              </button>
              .
            </p>
          ) : (
            <div role="list">
              {visible.map((txn: TransactionView) => (
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
