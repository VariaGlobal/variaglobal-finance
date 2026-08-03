'use client'

/**
 * Endpoint-specific hooks. Each maps the display-ready wire payload into the
 * shape the existing components already render, and supplies a bundled
 * fixture fallback so the UI keeps working until the routes land.
 *
 * Money and dates arrive pre-formatted from the server; we only re-key
 * fields, never recompute values.
 */

import { useRecordsResource, type RecordsResult } from '@/lib/records-api/use-records'
import type {
  CounterpartiesResponse,
  CycleWire,
  CyclesResponse,
  SummaryResponse,
  SummaryRowWire,
  SummaryType,
  SyncHealthResponse,
  SyncSourceWire,
  TransactionsResponse,
  TransactionWire,
} from '@/lib/records-api/types'
import type { Counterparty } from '@/lib/types'

// Data used ONLY as labeled fallback when an endpoint is unavailable.
import { counterparties as fixtureCounterparties } from '@/lib/fixtures/counterparties'
import { cyclesNewestFirst, type CycleDisplay } from '@/lib/fixtures/records/cycles'
import {
  fallbackBankTransactions,
  fallbackSyncSources,
} from '@/lib/records-api/fallback-data'

/* ── Counterparties ─────────────────────────────────────────────────
 * The registry comes back live with contracts: [] on purpose. We merge
 * fixture contracts by counterparty id where we have them. */

const CONTRACTS_BY_ID: Record<string, Counterparty['contracts']> = Object.fromEntries(
  fixtureCounterparties
    .filter((c) => c.contracts.length > 0)
    .map((c) => [c.id, c.contracts]),
)

function mergeContracts(list: Counterparty[]): Counterparty[] {
  return list.map((cp) =>
    cp.contracts.length === 0 && CONTRACTS_BY_ID[cp.id]
      ? { ...cp, contracts: CONTRACTS_BY_ID[cp.id] }
      : cp,
  )
}

export function useCounterparties(): RecordsResult<Counterparty[]> {
  return useRecordsResource<CounterpartiesResponse, Counterparty[]>(
    'counterparties',
    '/api/records/counterparties',
    (raw) => mergeContracts(raw.counterparties ?? []),
    fixtureCounterparties, // already carries contracts
  )
}

/* ── Pay cycles ─────────────────────────────────────────────────────
 * Map the wire cycle into the CycleDisplay the hub + detail already render.
 * All money/date strings pass through untouched. */

function lineState(line: CycleWire['lines'][number]): CycleDisplay['lines'][number]['state'] {
  if (line.trace?.includes('RUL') && !line.payable && !line.excludedReason && !line.deferredFrom) {
    return 'pending_ruling'
  }
  if (line.deferredFrom) return 'deferred_in'
  if (line.excludedReason) return 'excluded'
  return line.payable ? 'payable' : 'excluded'
}

function personSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapCycle(c: CycleWire): CycleDisplay {
  const lines = c.lines.map((line, i) => {
    const state = lineState(line)
    const originForeign = Boolean(line.originPeriod && line.originPeriod !== c.periodLabel)
    return {
      id: `${c.id}-line-${i}`,
      personId: personSlug(line.person),
      personName: line.person,
      hoursDisplay: line.hours,
      rateDisplay: line.rate,
      amountDisplay: line.amount,
      originPeriodLabel: line.originPeriod ?? c.periodLabel,
      originIsForeign: originForeign,
      state,
      stateLabel:
        state === 'excluded'
          ? (line.excludedReason ?? undefined)
          : state === 'deferred_in'
            ? `deferred in from ${line.deferredFrom}`
            : state === 'pending_ruling'
              ? 'pending ruling'
              : undefined,
      notes: [] as string[],
      trace: line.trace ?? '',
      rulingOptions: undefined,
    }
  })

  const status: CycleDisplay['status'] = c.status === 'paid' ? 'paid' : 'to_be_paid'
  const pendingRulingCount = lines.filter((l) => l.state === 'pending_ruling').length
  return {
    id: c.id,
    periodLabel: c.periodLabel,
    monthLabel: c.periodLabel, // server owns labels; keep the period text
    entityLabel: c.entityLabel ?? '',
    status,
    statusLabel: status === 'paid' ? `Paid ${c.payDate}` : `To be paid ${c.payDate}`,
    payDateLabel: c.payDate,
    payableDisplay: c.payable,
    vendorAccrualDisplay: c.vendorAccrual,
    peopleCount: new Set(c.lines.map((l) => l.person)).size,
    excludedCount: lines.filter((l) => l.state === 'excluded').length,
    pendingRulingCount,
    warnings: [],
    lines,
  }
}

export function useCycles(): RecordsResult<CycleDisplay[]> {
  return useRecordsResource<CyclesResponse, CycleDisplay[]>(
    'cycles',
    '/api/records/cycles',
    (raw) => (raw.cycles ?? []).map(mapCycle),
    cyclesNewestFirst,
  )
}

/* ── Transactions (Banking) ─────────────────────────────────────────
 * Wire rows carry display-ready amounts + a `category` for chips. We keep
 * the raw category through a light view model the hub renders directly. */

export interface TransactionView {
  id: string
  postedAt: string
  description: string
  amountDisplay: string
  direction: 'credit' | 'debit'
  account: string
  category?: string
  matched: boolean
}

function mapTransaction(t: TransactionWire): TransactionView {
  return {
    id: t.id,
    postedAt: t.postedAt,
    description: t.description,
    amountDisplay: t.amount,
    direction: t.direction === 'credit' ? 'credit' : 'debit',
    account: t.account,
    category: t.category ?? undefined,
    matched: Boolean(t.matched),
  }
}

const fixtureTransactionViews: TransactionView[] = fallbackBankTransactions.map((t) => ({
  id: t.id,
  postedAt: t.postedAt,
  description: t.description,
  amountDisplay: t.amount.display,
  direction: t.direction,
  account: t.account,
  category: undefined,
  matched: t.matched,
}))

export function useTransactions(entity?: string, limit?: number): RecordsResult<TransactionView[]> {
  const params = new URLSearchParams()
  if (entity) params.set('entity', entity)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return useRecordsResource<TransactionsResponse, TransactionView[]>(
    `transactions:${qs}`,
    `/api/records/transactions${qs ? `?${qs}` : ''}`,
    (raw) => (raw.transactions ?? []).map(mapTransaction),
    fixtureTransactionViews,
  )
}

/* ── Sync health (Settings → Integrations) ──────────────────────────── */

export interface SyncSourceView {
  id: string
  name: string
  scope: string
  health: 'healthy' | 'degraded' | 'down'
  healthNote: string
  lastSync: string
  recordsIngested: number
  webhookHeartbeat: string
  paused: boolean
}

function mapSyncSource(s: SyncSourceWire): SyncSourceView {
  const health =
    s.health === 'degraded' ? 'degraded' : s.health === 'down' ? 'down' : 'healthy'
  return {
    id: s.id,
    name: s.name,
    scope: s.scope,
    health,
    healthNote: s.healthNote,
    lastSync: s.lastSync,
    recordsIngested: s.recordsIngested,
    webhookHeartbeat: s.webhookHeartbeat,
    paused: Boolean(s.paused),
  }
}

export function useSyncHealth(): RecordsResult<SyncSourceView[]> {
  return useRecordsResource<SyncHealthResponse, SyncSourceView[]>(
    'sync-health',
    '/api/records/sync-health',
    (raw) => (raw.sources ?? []).map(mapSyncSource),
    fallbackSyncSources,
  )
}

/* ── Summary (hover cards) ──────────────────────────────────────────
 * id conventions: person = full name ("Megan Breyer"), counterparty = slug
 * ("interrupt-media"), cycle = "2026-07-H1". Prefetched for visible rows so
 * hovers stay instant — see prefetchSummaries below. */

export function summaryUrl(type: SummaryType, id: string): string {
  return `/api/records/summary?type=${type}&id=${encodeURIComponent(id)}`
}

export function summaryKey(type: SummaryType, id: string): string {
  return `summary:${type}:${id}`
}

export type { SummaryRowWire, SummaryResponse }
