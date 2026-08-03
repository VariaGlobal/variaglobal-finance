'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRightIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecordHover } from '@/components/records/record-hover'
import {
  HubCanvas,
  PageHeader,
  RecordsEmpty,
  StatusChip,
  moneyHubSubtitles,
} from '@/components/records/records-bits'
import { MasterDetail, DetailPlaceholder } from '@/components/records/master-detail'
import { cn } from '@/lib/utils'
import type { Counterparty } from '@/lib/types'
import type { BillingDirection, BillingInvoice, PaymentDisplay } from '@/lib/fixtures/records/billing'
import {
  buildBillingView,
  type AgingBucket,
  type CounterpartyGroup,
  type DirectionView,
  type InvoiceView,
} from '@/lib/fixtures/records/billing-view'

export function BillingHub({
  invoices,
  payments,
  counterparties,
  action,
  onOpenBanking,
}: {
  invoices: BillingInvoice[]
  payments: PaymentDisplay[]
  counterparties: Counterparty[]
  action?: React.ReactNode
  /** Jump to the Banking hub, optionally for a specific matched transaction. */
  onOpenBanking?: (bankTransactionId?: string) => void
}) {
  const view = useMemo(
    () => buildBillingView(invoices, payments, counterparties),
    [invoices, payments, counterparties],
  )

  const [direction, setDirection] = useState<BillingDirection>('receivable')
  const [activeBucket, setActiveBucket] = useState<AgingBucket | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  if (invoices.length === 0) {
    return (
      <HubCanvas>
        <RecordsEmpty
          title="Nothing billed yet."
          subline="Invoices and the payments that settle them appear here, linked line by line to bank rows."
        />
      </HubCanvas>
    )
  }

  const dir = view[direction]

  const filteredGroups = activeBucket
    ? dir.groups.filter((g) => g.invoices.some((v) => v.bucket === activeBucket))
    : dir.groups

  const selectedDraft =
    selectedKey?.startsWith('draft:') && direction === 'receivable'
      ? (dir.drafts.find((d) => `draft:${d.id}` === selectedKey) ?? null)
      : null
  const selectedGroup = selectedKey?.startsWith('cp:')
    ? (dir.groups.find((g) => `cp:${g.counterpartyId}` === selectedKey) ?? null)
    : null
  const hasSelection = Boolean(selectedDraft || selectedGroup)

  function changeDirection(next: BillingDirection) {
    setDirection(next)
    setActiveBucket(null)
    setSelectedKey(null)
    setExpanded(new Set())
  }

  function toggleBucket(bucket: AgingBucket | null) {
    setActiveBucket((cur) => (cur === bucket ? null : bucket))
  }

  function toggleExpand(id: string) {
    setExpanded((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const dirNoun = direction === 'receivable' ? 'owed to us' : 'we owe'
  const directionInvoiceCount =
    dir.groups.reduce((s, g) => s + g.totalInvoiceCount, 0) + dir.drafts.length

  return (
    <MasterDetail
      hasSelection={hasSelection}
      onBack={() => setSelectedKey(null)}
      backLabel="Billing"
      selectionKey={selectedKey}
      header={
        <>
          <PageHeader
            title="Billing"
            eyebrow={`Money · ${moneyHubSubtitles.billing}`}
            count={directionInvoiceCount}
            countNoun="invoice"
            description="Who owes what, how late, and what still needs sending. Sample data until invoices land in the database."
            source="fallback"
            action={action}
          />
          <div className="flex shrink-0 flex-col gap-4 border-b border-border px-5 py-4 md:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <DirectionToggle direction={direction} view={view} onChange={changeDirection} />
              <span className="text-xs text-muted-foreground">
                Total {dirNoun}:{' '}
                <span
                  className={cn(
                    'font-mono tabular-nums',
                    dir.totalOpenCents > 0 ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {dir.totalOpenDisplay}
                </span>
              </span>
            </div>
            <AgingStrip dir={dir} activeBucket={activeBucket} onSelect={toggleBucket} />
          </div>
        </>
      }
      list={
        <div className="flex flex-col gap-1">
          {/* Needs sending — drafts are to-dos, not receivables */}
          {dir.drafts.length > 0 && (
            <div className="pb-1">
              <h3 className="px-4 pt-1 pb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
                Needs sending · {dir.drafts.length}
              </h3>
              {dir.drafts.map((d) => (
                <RailRow
                  key={d.id}
                  selected={selectedKey === `draft:${d.id}`}
                  accent="attention"
                  onClick={() => setSelectedKey(`draft:${d.id}`)}
                  title={d.number}
                  subtitle={d.counterpartyName}
                  amount={d.totalDisplay}
                  amountMuted
                  trailing={<StatusChip tone="neutral">draft</StatusChip>}
                />
              ))}
              <div className="mx-4 my-2 border-t border-border/60" />
            </div>
          )}

          <h3 className="px-4 pt-1 pb-2 text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
            Counterparties
          </h3>
          {filteredGroups.length === 0 ? (
            <p className="text-meta px-4 py-2">No invoices in this bucket.</p>
          ) : (
            filteredGroups.map((g) => (
              <RailRow
                key={g.counterpartyId}
                selected={selectedKey === `cp:${g.counterpartyId}`}
                accent={g.hasOverdue ? 'danger' : 'default'}
                onClick={() => setSelectedKey(`cp:${g.counterpartyId}`)}
                title={g.counterpartyName}
                subtitle={`${g.openInvoiceCount} open · ${g.totalInvoiceCount} total`}
                amount={g.openBalanceDisplay}
                amountDanger={g.hasOverdue}
                amountMuted={g.openBalanceCents === 0}
                trailing={
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/40" />
                }
              />
            ))
          )}
        </div>
      }
      detail={
        selectedDraft ? (
          <DraftDetail draft={selectedDraft} />
        ) : selectedGroup ? (
          <CounterpartyDetail
            group={selectedGroup}
            direction={direction}
            activeBucket={activeBucket}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            onOpenBanking={onOpenBanking}
          />
        ) : null
      }
      emptyDetail={
        <DetailPlaceholder
          title={`Select who ${direction === 'receivable' ? 'owes us' : 'we owe'}`}
          subline="Their invoices, balances, payments, and the trace behind each open figure open here."
        />
      }
    />
  )
}

/* ── Direction toggle ─────────────────────────────────────────────────── */

function DirectionToggle({
  direction,
  view,
  onChange,
}: {
  direction: BillingDirection
  view: ReturnType<typeof buildBillingView>
  onChange: (d: BillingDirection) => void
}) {
  const options: { id: BillingDirection; label: string }[] = [
    { id: 'receivable', label: 'Owed to us' },
    { id: 'payable', label: 'We owe' },
  ]
  return (
    <div
      role="tablist"
      aria-label="Billing direction"
      className="inline-flex items-center rounded-lg border border-border p-0.5"
    >
      {options.map((opt) => {
        const active = direction === opt.id
        const openCount = view[opt.id].groups.reduce((s, g) => s + g.openInvoiceCount, 0)
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150',
              active
                ? 'bg-foreground/[0.06] font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
              {openCount}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Aging strip ──────────────────────────────────────────────────────── */

function AgingStrip({
  dir,
  activeBucket,
  onSelect,
}: {
  dir: DirectionView
  activeBucket: AgingBucket | null
  onSelect: (b: AgingBucket | null) => void
}) {
  const openCount = dir.aging.reduce((s, c) => s + c.count, 0)

  const cells: {
    key: string
    bucket: AgingBucket | null
    label: string
    totalDisplay: string
    totalCents: number
    count: number
    danger: boolean
    disputed: boolean
  }[] = [
    {
      key: 'all',
      bucket: null,
      label: 'All open',
      totalDisplay: dir.totalOpenDisplay,
      totalCents: dir.totalOpenCents,
      count: openCount,
      danger: false,
      disputed: false,
    },
    ...dir.aging.map((c) => ({
      key: c.bucket,
      bucket: c.bucket,
      label: c.label,
      totalDisplay: c.totalDisplay,
      totalCents: c.totalCents,
      count: c.count,
      danger: c.danger,
      disputed: c.bucket === 'disputed',
    })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5">
      {cells.map((cell) => {
        const active =
          cell.key === 'all' ? activeBucket === null : activeBucket === cell.bucket
        const empty = cell.count === 0 && cell.key !== 'all'
        const amountColor =
          cell.totalCents <= 0
            ? 'text-muted-foreground'
            : cell.danger
              ? 'text-variance'
              : cell.disputed
                ? 'text-held'
                : 'text-foreground'
        return (
          <button
            key={cell.key}
            type="button"
            aria-pressed={active}
            disabled={empty}
            onClick={() => onSelect(cell.bucket)}
            className={cn(
              'flex min-w-[100px] flex-col gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors duration-150',
              active
                ? 'border-foreground/30 bg-foreground/[0.05]'
                : 'border-border hover:bg-foreground/[0.025]',
              empty && 'cursor-default opacity-40 hover:bg-transparent',
            )}
          >
            <span className="text-[10.5px] font-medium tracking-[0.05em] text-muted-foreground/70 uppercase">
              {cell.label}
            </span>
            <span className={cn('font-mono text-sm tabular-nums', amountColor)}>
              {cell.totalDisplay}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {cell.count} {cell.count === 1 ? 'invoice' : 'invoices'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Rail rows ────────────────────────────────────────────────────────── */

function RailRow({
  selected,
  accent = 'default',
  onClick,
  title,
  subtitle,
  amount,
  amountDanger,
  amountMuted,
  trailing,
}: {
  selected: boolean
  accent?: 'default' | 'danger' | 'attention'
  onClick: () => void
  title: string
  subtitle: string
  amount: string
  amountDanger?: boolean
  amountMuted?: boolean
  trailing?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected}
      className={cn(
        'relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150',
        selected ? 'bg-foreground/[0.05]' : 'hover:bg-foreground/[0.025]',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 left-0 w-0.5 rounded-full transition-colors duration-150',
          selected
            ? accent === 'danger'
              ? 'bg-variance'
              : accent === 'attention'
                ? 'bg-held'
                : 'bg-foreground'
            : 'bg-transparent',
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{title}</span>
        <span className="text-[11px] text-muted-foreground">{subtitle}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            'font-mono text-sm tabular-nums',
            amountMuted
              ? 'text-muted-foreground'
              : amountDanger
                ? 'text-variance'
                : 'text-foreground',
          )}
        >
          {amount}
        </span>
        {trailing}
      </span>
    </button>
  )
}

/* ── Counterparty detail ──────────────────────────────────────────────── */

function orderInvoices(list: InvoiceView[]): InvoiceView[] {
  const rank = (v: InvoiceView) => (v.isException ? 2 : v.balanceCents > 0 ? 0 : 1)
  return [...list].sort((a, b) => rank(a) - rank(b) || b.balanceCents - a.balanceCents)
}

function CounterpartyDetail({
  group,
  direction,
  activeBucket,
  expanded,
  onToggleExpand,
  onOpenBanking,
}: {
  group: CounterpartyGroup
  direction: BillingDirection
  activeBucket: AgingBucket | null
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  onOpenBanking?: (bankTransactionId?: string) => void
}) {
  const shown = orderInvoices(
    activeBucket ? group.invoices.filter((v) => v.bucket === activeBucket) : group.invoices,
  )

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-6 pt-6 pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <RecordHover recordId={group.counterpartyId}>
            <h2 className="text-xl font-medium tracking-tight text-foreground">
              {group.counterpartyName}
            </h2>
          </RecordHover>
          <span className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
            {direction === 'receivable' ? 'owed to us' : 'we owe'}
          </span>
        </div>
        <p className="mt-2 font-mono text-sm tabular-nums">
          <span className={group.hasOverdue ? 'text-variance' : 'text-foreground'}>
            {group.openBalanceDisplay}
          </span>
          <span className="text-muted-foreground">
            {' '}
            open · {group.openInvoiceCount} of {group.totalInvoiceCount} invoices
          </span>
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="text-meta px-6 py-6">No invoices in this bucket for {group.counterpartyName}.</p>
      ) : (
        <div role="list">
          {shown.map((v) => (
            <InvoiceRow
              key={v.id}
              invoice={v}
              open={expanded.has(v.id)}
              onToggle={() => onToggleExpand(v.id)}
              onOpenBanking={onOpenBanking}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InvoiceRow({
  invoice: v,
  open,
  onToggle,
  onOpenBanking,
}: {
  invoice: InvoiceView
  open: boolean
  onToggle: () => void
  onOpenBanking?: (bankTransactionId?: string) => void
}) {
  const settled = v.balanceCents <= 0 && !v.isException
  return (
    <div role="listitem" className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.025]"
      >
        <ChevronRightIcon
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-150',
            open && 'rotate-90',
          )}
        />
        <span className="w-[104px] shrink-0 font-mono text-sm tabular-nums text-foreground">
          {v.number}
        </span>
        <StatusChip tone={v.statusTone}>{v.status.replace(/_/g, ' ')}</StatusChip>
        <span
          className={cn(
            'hidden text-xs sm:inline',
            v.overdue ? 'text-variance' : 'text-muted-foreground',
          )}
        >
          {v.dueRelative}
        </span>
        <span className="ml-auto flex flex-col items-end">
          <span className="font-mono text-sm tabular-nums">
            <span
              className={cn(
                v.isException
                  ? 'text-muted-foreground line-through'
                  : v.overdue
                    ? 'text-variance'
                    : settled
                      ? 'text-muted-foreground'
                      : 'text-foreground',
              )}
            >
              {settled ? 'settled' : v.balanceDisplay}
            </span>
          </span>
          {!settled && !v.isException && (
            <span className="text-[11px] text-muted-foreground">open of {v.totalDisplay}</span>
          )}
          {v.isException && (
            <span className="text-[11px] text-muted-foreground">{v.dueRelative}</span>
          )}
        </span>
      </button>

      {open && (
        <div className="animate-detail-in space-y-4 pt-1 pr-6 pb-5 pl-[38px]">
          {/* Line items */}
          <div>
            <h4 className="pb-1.5 text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
              Line items
            </h4>
            {v.lines.map((l) => (
              <div key={l.id} className="flex items-baseline justify-between gap-3 py-1 text-sm">
                <span className="text-muted-foreground">{l.description}</span>
                <span className="font-mono tabular-nums text-foreground">{l.amountDisplay}</span>
              </div>
            ))}
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border/60 pt-1.5">
              <span className="text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
                Total billed
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {v.totalDisplay}
              </span>
            </div>
          </div>

          {/* Payments applied — linked to their bank rows when matched */}
          <div>
            <h4 className="pb-1.5 text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
              {v.direction === 'receivable' ? 'Payments received' : 'Payments made'}
            </h4>
            {v.payments.length === 0 ? (
              <p className="text-meta">
                {v.isException ? 'Not applicable.' : `Nothing ${v.direction === 'receivable' ? 'received' : 'paid'} yet.`}
              </p>
            ) : (
              v.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-1">
                  <span className="flex flex-col">
                    <span className="font-mono text-sm tabular-nums text-prepared">
                      {p.amountDisplay}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {p.dateDisplay} · {p.method}
                    </span>
                  </span>
                  {p.matched && p.bankRowLabel ? (
                    <button
                      type="button"
                      onClick={() => onOpenBanking?.(p.bankTransactionId)}
                      className="flex items-center gap-1 rounded-sm text-xs text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                      title="Open this row in Banking"
                    >
                      {p.bankRowLabel}
                      <ArrowUpRightIcon className="size-3" />
                    </button>
                  ) : (
                    <span className="text-meta">unmatched</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Balance trace */}
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {v.balanceTrace}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Draft detail ─────────────────────────────────────────────────────── */

function DraftDetail({ draft }: { draft: InvoiceView }) {
  return (
    <div className="flex flex-col px-6 pt-6 pb-8">
      <span className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
        Needs sending
      </span>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-xl font-medium tracking-tight text-foreground">{draft.number}</h2>
        <StatusChip tone="neutral">draft</StatusChip>
      </div>
      <p className="text-meta mt-1">
        {draft.counterpartyName} · would bill{' '}
        <span className="font-mono tabular-nums text-foreground">{draft.totalDisplay}</span>
      </p>

      <div className="mt-6">
        <h4 className="pb-1.5 text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
          Line items
        </h4>
        {draft.lines.map((l) => (
          <div key={l.id} className="flex items-baseline justify-between gap-3 py-1 text-sm">
            <span className="text-muted-foreground">{l.description}</span>
            <span className="font-mono tabular-nums text-foreground">{l.amountDisplay}</span>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border/60 pt-1.5">
          <span className="text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
            Total
          </span>
          <span className="font-mono text-sm tabular-nums text-foreground">
            {draft.totalDisplay}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <p className="text-sm text-foreground">A draft is a to-do, not a receivable.</p>
        <p className="text-meta mt-1">
          It stays out of aging and open balances until it&apos;s sent.
        </p>
        <Button
          size="sm"
          className="mt-3"
          disabled
          title="Sending invoices lands when billing is live in the database."
        >
          Send invoice
        </Button>
      </div>
    </div>
  )
}
