/**
 * Billing view model — the ONE place invoice math happens.
 *
 * Components stay dumb: they render the display strings this module produces.
 * We compute balances (total − payments applied), aging buckets, relative due
 * ("12d overdue"), per-counterparty groups, and a human-readable balance
 * trace. Everything downstream is presentation only.
 *
 * Reference "today" is pinned to the app date so sample data lands in stable
 * buckets; swap for `new Date()` once invoices are live.
 */

import type { BillingDirection, BillingInvoice, PaymentDisplay } from '@/lib/fixtures/records/billing'
import type { Counterparty } from '@/lib/types'
import type { StatusTone } from '@/components/records/records-bits'

const TODAY = new Date(2026, 7, 3) // Aug 3, 2026

export type AgingBucket = 'current' | 'd1_30' | 'd31_60' | 'd60_plus' | 'disputed'

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

function fmt(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  const rem = String(abs % 100).padStart(2, '0')
  return `${sign}$${dollars}.${rem}`
}

/** Parse a "Mon D" fixture date into days overdue vs TODAY (negative = future). */
function daysOverdue(due?: string): number | null {
  if (!due || due === '—') return null
  const [mon, dayStr] = due.split(' ')
  const month = MONTHS[mon]
  const day = Number(dayStr)
  if (month === undefined || Number.isNaN(day)) return null
  const dueDate = new Date(2026, month, day)
  return Math.floor((TODAY.getTime() - dueDate.getTime()) / 86_400_000)
}

export interface PaymentAppliedView {
  id: string
  dateDisplay: string
  amountDisplay: string
  method: string
  bankRowLabel?: string
  bankTransactionId?: string
  matched: boolean
}

export interface InvoiceView {
  id: string
  number: string
  direction: BillingDirection
  counterpartyId: string
  counterpartyName: string
  status: BillingInvoice['status']
  statusTone: StatusTone
  lines: { id: string; description: string; amountDisplay: string }[]
  totalDisplay: string
  paidDisplay: string
  balanceDisplay: string
  balanceCents: number
  issuedAt: string
  dueAt?: string
  /** "12d overdue" · "due in 5d" · "due today" · "settled" · "" */
  dueRelative: string
  overdue: boolean
  bucket: AgingBucket | null
  isDraft: boolean
  isException: boolean // void / credit_note
  payments: PaymentAppliedView[]
  /** "$7,000.00 billed − $4,620.00 received = $2,380.00 open" */
  balanceTrace: string
}

export interface CounterpartyGroup {
  counterpartyId: string
  counterpartyName: string
  invoices: InvoiceView[]
  openBalanceDisplay: string
  openBalanceCents: number
  openInvoiceCount: number
  totalInvoiceCount: number
  hasOverdue: boolean
}

export interface AgingCell {
  bucket: AgingBucket
  label: string
  totalDisplay: string
  totalCents: number
  count: number
  /** true for the overdue buckets (danger tone) */
  danger: boolean
}

export interface DirectionView {
  direction: BillingDirection
  groups: CounterpartyGroup[]
  drafts: InvoiceView[]
  aging: AgingCell[]
  totalOpenDisplay: string
  totalOpenCents: number
}

export interface BillingView {
  receivable: DirectionView
  payable: DirectionView
}

const STATUS_TONE: Record<BillingInvoice['status'], StatusTone> = {
  draft: 'neutral',
  sent: 'pending',
  partially_paid: 'pending',
  paid: 'positive',
  disputed: 'attention',
  credit_note: 'neutral',
  void: 'neutral',
}

function bucketFor(inv: {
  status: BillingInvoice['status']
  balanceCents: number
  over: number | null
}): AgingBucket | null {
  if (inv.balanceCents <= 0) return null
  if (inv.status === 'disputed') return 'disputed'
  const d = inv.over
  if (d === null || d <= 0) return 'current'
  if (d <= 30) return 'd1_30'
  if (d <= 60) return 'd31_60'
  return 'd60_plus'
}

function buildInvoiceView(
  inv: BillingInvoice,
  payments: PaymentDisplay[],
  nameOf: (id: string) => string,
): InvoiceView {
  const applied = payments.filter((p) => p.invoiceId === inv.id)
  const paidCents = applied.reduce((sum, p) => sum + p.amount.cents, 0)
  const isException = inv.status === 'void' || inv.status === 'credit_note'
  const isDraft = inv.status === 'draft'
  const balanceCents = isException ? 0 : inv.total.cents - paidCents
  const over = daysOverdue(inv.dueAt)
  const bucket = isDraft || isException ? null : bucketFor({ status: inv.status, balanceCents, over })
  const overdue = bucket === 'd1_30' || bucket === 'd31_60' || bucket === 'd60_plus'

  const receivedVerb = inv.direction === 'receivable' ? 'received' : 'paid'

  let dueRelative = ''
  if (isException) dueRelative = inv.status === 'void' ? 'void' : 'credit note'
  else if (isDraft) dueRelative = 'not sent'
  else if (balanceCents <= 0) dueRelative = 'settled'
  else if (over === null) dueRelative = '—'
  else if (over > 0) dueRelative = `${over}d overdue`
  else if (over === 0) dueRelative = 'due today'
  else dueRelative = `due in ${-over}d`

  let balanceTrace: string
  if (isException) {
    balanceTrace = `${fmt(inv.total.cents)} ${inv.status === 'void' ? 'voided — nothing owed' : 'credited'}`
  } else if (paidCents <= 0) {
    balanceTrace = `${fmt(inv.total.cents)} billed · nothing ${receivedVerb} yet = ${fmt(balanceCents)} open`
  } else if (balanceCents <= 0) {
    balanceTrace = `${fmt(inv.total.cents)} billed − ${fmt(paidCents)} ${receivedVerb} = settled`
  } else {
    balanceTrace = `${fmt(inv.total.cents)} billed − ${fmt(paidCents)} ${receivedVerb} = ${fmt(balanceCents)} open`
  }

  return {
    id: inv.id,
    number: inv.number,
    direction: inv.direction,
    counterpartyId: inv.clientId,
    counterpartyName: nameOf(inv.clientId),
    status: inv.status,
    statusTone: STATUS_TONE[inv.status],
    lines: inv.lines.map((l) => ({ id: l.id, description: l.description, amountDisplay: l.amount.display })),
    totalDisplay: inv.total.display,
    paidDisplay: fmt(paidCents),
    balanceDisplay: fmt(balanceCents),
    balanceCents,
    issuedAt: inv.issuedAt,
    dueAt: inv.dueAt,
    dueRelative,
    overdue,
    bucket,
    isDraft,
    isException,
    payments: applied.map((p) => ({
      id: p.id,
      dateDisplay: p.receivedAt,
      amountDisplay: p.amount.display,
      method: p.method,
      bankRowLabel: p.bankRowLabel,
      bankTransactionId: p.bankTransactionId,
      matched: Boolean(p.bankTransactionId),
    })),
    balanceTrace,
  }
}

const AGING_META: { bucket: AgingBucket; label: string; danger: boolean }[] = [
  { bucket: 'current', label: 'Current', danger: false },
  { bucket: 'd1_30', label: '1–30', danger: true },
  { bucket: 'd31_60', label: '31–60', danger: true },
  { bucket: 'd60_plus', label: '60+', danger: true },
  { bucket: 'disputed', label: 'Disputed', danger: false },
]

function buildDirection(direction: BillingDirection, all: InvoiceView[]): DirectionView {
  const mine = all.filter((v) => v.direction === direction)
  const drafts = mine.filter((v) => v.isDraft)

  // Aging is computed over open (non-draft, non-exception, balance>0) invoices.
  const aging: AgingCell[] = AGING_META.map((m) => {
    const inBucket = mine.filter((v) => v.bucket === m.bucket)
    const totalCents = inBucket.reduce((s, v) => s + v.balanceCents, 0)
    return {
      bucket: m.bucket,
      label: m.label,
      totalDisplay: fmt(totalCents),
      totalCents,
      count: inBucket.length,
      danger: m.danger,
    }
  })

  // Group by counterparty; drafts and exceptions still belong to their group
  // for context, but only open invoices drive the open-balance headline.
  const byId = new Map<string, InvoiceView[]>()
  for (const v of mine) {
    if (v.isDraft) continue // drafts surface in their own "Needs sending" rail
    const list = byId.get(v.counterpartyId) ?? []
    list.push(v)
    byId.set(v.counterpartyId, list)
  }

  const groups: CounterpartyGroup[] = [...byId.entries()]
    .map(([id, list]) => {
      const openList = list.filter((v) => v.balanceCents > 0 && !v.isException)
      const openBalanceCents = openList.reduce((s, v) => s + v.balanceCents, 0)
      return {
        counterpartyId: id,
        counterpartyName: list[0].counterpartyName,
        invoices: list,
        openBalanceDisplay: fmt(openBalanceCents),
        openBalanceCents,
        openInvoiceCount: openList.length,
        totalInvoiceCount: list.length,
        hasOverdue: openList.some((v) => v.overdue),
      }
    })
    // Most owed first; overdue counterparties float up within equal balances.
    .sort((a, b) => b.openBalanceCents - a.openBalanceCents)

  const totalOpenCents = groups.reduce((s, g) => s + g.openBalanceCents, 0)

  return {
    direction,
    groups,
    drafts,
    aging,
    totalOpenDisplay: fmt(totalOpenCents),
    totalOpenCents,
  }
}

export function buildBillingView(
  invoices: BillingInvoice[],
  payments: PaymentDisplay[],
  counterparties: Counterparty[],
): BillingView {
  const nameOf = (id: string) => counterparties.find((c) => c.id === id)?.name ?? id
  const all = invoices.map((inv) => buildInvoiceView(inv, payments, nameOf))
  return {
    receivable: buildDirection('receivable', all),
    payable: buildDirection('payable', all),
  }
}
