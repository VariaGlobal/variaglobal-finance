/**
 * Wire types for the live Records API (app/api/records/*). These endpoints
 * return DISPLAY-READY strings — money and dates are already formatted
 * server-side. The client renders them verbatim and never computes money
 * or dates. Owned by the backend engineer; mirrored here for the client.
 */

import type { Counterparty, CounterpartyRole, EntityId } from '@/lib/types'

/* GET /api/records/counterparties → { counterparties } */
export interface CounterpartiesResponse {
  counterparties: Counterparty[]
}

/* GET /api/records/cycles → { cycles } */
export interface CycleLineWire {
  person: string
  hours: string // "31.00h"
  rate: string // "$70.00/h" | "—"
  amount: string // "$3,710.00" | "—"
  payable: boolean
  excludedReason?: string | null
  deferredFrom?: string | null // cycle id the work was deferred out of
  originPeriod?: string | null // "Jun 16–30" — true period of the work
  trace?: string | null // "timesheet#4821 · rate-card v3 · RUL-002"
}

export interface CycleWire {
  id: string // "2026-07-H1"
  periodLabel: string // "Jul 1–15"
  payDate: string // "Jul 31"
  status: 'paid' | 'to_be_paid' | string
  payable: string // "$14,953.08"
  vendorAccrual: string // "$1,375.00"
  entityLabel?: string
  lines: CycleLineWire[]
}

export interface CyclesResponse {
  cycles: CycleWire[]
}

/* GET /api/records/transactions?entity=&limit= → { transactions } */
export interface TransactionWire {
  id: string
  account: string // "The Matchbox checking"
  entity: EntityId | string
  direction: 'credit' | 'debit' | string
  amount: string // "-$1,074.92" — display-ready, sign included
  description: string
  postedAt: string // "Jul 15"
  category?: string | null // "owner_draw", "artist_royalty_payout", …
  matched?: boolean
}

export interface TransactionsResponse {
  transactions: TransactionWire[]
}

/* GET /api/records/sync-health → { sources } */
export interface SyncSourceWire {
  id: string
  name: string // "Mercury"
  scope: string // "The Matchbox · Spyll World"
  health: 'healthy' | 'degraded' | 'down' | string
  healthNote: string
  lastSync: string // "Jul 27, 06:12"
  recordsIngested: number
  webhookHeartbeat: string // "2 min ago" | "—"
  paused?: boolean
}

export interface SyncHealthResponse {
  sources: SyncSourceWire[]
}

/* GET /api/records/summary?type=&id= → { rows } */
export interface SummaryRowWire {
  label: string
  value: string
  asOf?: string | null
}

export interface SummaryResponse {
  rows: SummaryRowWire[]
}

export type SummaryType = 'person' | 'counterparty' | 'cycle'

/** How a hub obtained its current data. Drives the "sample data" chip. */
export type DataSource = 'live' | 'fallback'

/** Merge fixture contracts into a live counterparty list by id. */
export type ContractsByCounterparty = Record<string, Counterparty['contracts']>
export type { Counterparty, CounterpartyRole }
