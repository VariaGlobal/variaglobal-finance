/**
 * Server data layer — Neon in, UI types out. Every display string is computed
 * HERE (money, hours, as-of dates); components render, never calculate.
 * Boundary mappers live here too: DB vocabulary <-> UI vocabulary.
 */

import { eq } from 'drizzle-orm'
import { getDb } from '@/db/client'
import * as s from '@/db/schema'
import { formatCents, formatHours } from '@/lib/engine/payroll'
import type { Counterparty, CounterpartyRole, Relationship } from '@/lib/types'

/** DB role ids -> UI role labels (UI uses spaces). */
const ROLE_TO_UI: Record<string, CounterpartyRole> = {
  client: 'client',
  customer: 'customer',
  vendor: 'vendor',
  partner: 'partner',
  royalty_source: 'royalty source',
  commission_source: 'commission source',
}

/** DB entity ids -> UI entity ids (publishing brand-named in the UI). */
const ENTITY_TO_UI: Record<string, string> = { 'bisaria-publishing': 'spyll-publishing' }
const uiEntity = (e: string) => ENTITY_TO_UI[e] ?? e

const STATUS_TO_UI: Record<string, Relationship['status']> = {
  active: 'active',
  ended: 'ended',
  prospect: 'dormant',
}

export async function getCounterparties(): Promise<Counterparty[]> {
  const db = getDb()
  const [cps, rels, aliases] = await Promise.all([
    db.select().from(s.counterparties),
    db.select().from(s.relationships),
    db.select().from(s.counterpartyAliases),
  ])
  const aliasesByCp = new Map<string, string[]>()
  for (const a of aliases) {
    const list = aliasesByCp.get(a.counterpartyId) ?? []
    list.push(a.alias)
    aliasesByCp.set(a.counterpartyId, list)
  }
  const relsByCp = new Map<string, Relationship[]>()
  const rolesByCp = new Map<string, Set<CounterpartyRole>>()
  for (const r of rels) {
    const role = ROLE_TO_UI[r.role]
    if (!role) continue // roles outside the UI union (owner, artist, tax_agency) surface later
    const rel: Relationship = {
      id: r.id,
      role,
      entity: uiEntity(r.entity) as Relationship['entity'],
      streamType: r.streamType ?? '',
      status: STATUS_TO_UI[r.status] ?? 'dormant',
      effectiveFrom: r.effectiveFrom ?? '',
      effectiveUntil: r.effectiveTo ?? undefined,
    }
    const list = relsByCp.get(r.counterpartyId) ?? []
    list.push(rel)
    relsByCp.set(r.counterpartyId, list)
    const set = rolesByCp.get(r.counterpartyId) ?? new Set<CounterpartyRole>()
    set.add(role)
    rolesByCp.set(r.counterpartyId, set)
  }
  return cps
    .map((c) => ({
      id: c.id,
      name: c.name,
      aliases: aliasesByCp.get(c.id),
      roles: [...(rolesByCp.get(c.id) ?? [])],
      relationships: relsByCp.get(c.id) ?? [],
      contracts: [], // contracts stay fixture-side until the contracts phase lands in the DB
      hoursByMonth: undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export interface CycleLineOut {
  person: string
  hours: string
  rate: string | null
  amount: string | null
  payable: boolean
  excludedReason: string | null
  deferredFrom: string | null
  originPeriod: string
  trace: string
}

export interface CycleOut {
  id: string
  entity: string
  periodLabel: string
  payDate: string
  status: string
  payable: string
  vendorAccrual: string
  lines: CycleLineOut[]
}

function periodLabel(startIso: string, endIso: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const sm = months[Number(startIso.slice(5, 7)) - 1]
  const em = months[Number(endIso.slice(5, 7)) - 1]
  const sd = Number(startIso.slice(8, 10))
  const ed = Number(endIso.slice(8, 10))
  const yr = startIso.slice(0, 4)
  return sm === em ? `${sm} ${sd}–${ed} ${yr}` : `${sm} ${sd} – ${em} ${ed} ${yr}`
}

export async function getCycles(): Promise<CycleOut[]> {
  const db = getDb()
  const [cycles, lines] = await Promise.all([db.select().from(s.payCycles), db.select().from(s.payCycleLines)])
  return cycles
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
    .map((c) => {
      const ls = lines.filter((l) => l.cycleId === c.id)
      const payable = ls.filter((l) => l.payable).reduce((a, l) => a + (l.amountCents ?? 0), 0)
      const accrual = ls.filter((l) => l.excludedReason !== null).reduce((a, l) => a + (l.amountCents ?? 0), 0)
      return {
        id: c.id,
        entity: c.entity,
        periodLabel: periodLabel(c.periodStart, c.periodEnd),
        payDate: c.scheduledPayDate,
        status: c.status,
        payable: formatCents(payable),
        vendorAccrual: formatCents(accrual),
        lines: ls
          .sort((a, b) => Number(b.payable) - Number(a.payable) || a.person.localeCompare(b.person))
          .map((l) => ({
            person: l.person,
            hours: formatHours(l.minutes),
            rate: l.rateCents === null ? null : `${formatCents(l.rateCents)}/h`,
            amount: l.amountCents === null ? null : formatCents(l.amountCents),
            payable: l.payable,
            excludedReason: l.excludedReason,
            deferredFrom: l.deferredFrom,
            originPeriod: `${l.originStart}..${l.originEnd}`,
            trace: l.trace,
          })),
      }
    })
}

export interface TransactionOut {
  id: string
  postedAt: string
  counterparty: string
  amount: string
  direction: 'in' | 'out'
  memo: string
  status: string
  glCode: string | null
  category: string | null
  entity: string
}

export async function getTransactions(entity?: string, limit = 200): Promise<TransactionOut[]> {
  const db = getDb()
  const [txns, cats] = await Promise.all([db.select().from(s.bankTransactions), db.select().from(s.transactionCategorizations)])
  const liveCat = new Map<string, string>()
  for (const c of cats) if (c.supersededBy === null) liveCat.set(c.mercuryId, c.category)
  return txns
    .filter((t) => !entity || t.entity === entity)
    .sort((a, b) => (b.postedAt ?? '').localeCompare(a.postedAt ?? ''))
    .slice(0, limit)
    .map((t) => ({
      id: t.mercuryId,
      postedAt: (t.postedAt ?? '').slice(0, 10),
      counterparty: t.counterpartyName ?? '—',
      amount: formatCents(t.amountCents),
      direction: t.amountCents >= 0 ? 'in' : 'out',
      memo: t.externalMemo ?? t.bankDescription ?? '',
      status: t.status,
      glCode: t.glCode,
      category: liveCat.get(t.mercuryId) ?? null,
      entity: t.entity,
    }))
}

export interface SyncHealthOut {
  source: string
  lastRun: string
  status: string
  inserted: number
  updated: number
  upstreamChanges: number
  notes: string | null
}

export async function getSyncHealth(): Promise<SyncHealthOut[]> {
  const db = getDb()
  const runs = await db.select().from(s.syncRuns)
  const latest = new Map<string, (typeof runs)[number]>()
  for (const r of runs) {
    const prev = latest.get(r.source)
    if (!prev || r.id > prev.id) latest.set(r.source, r)
  }
  return [...latest.values()].map((r) => ({
    source: r.source,
    lastRun: (r.finishedAt ?? r.startedAt).toISOString(),
    status: r.status,
    inserted: r.inserted ?? 0,
    updated: r.updated ?? 0,
    upstreamChanges: r.upstreamChanges ?? 0,
    notes: r.notes,
  }))
}

export interface SummaryRow {
  label: string
  value: string
  asOf?: string
}

const MONTH_LABEL: Record<string, string> = {
  '2026-06': 'Jun 2026',
  '2026-07': 'Jul 2026',
  '2026-08': 'Aug 2026',
}
const monthLabel = (m: string) => MONTH_LABEL[m] ?? m

export async function getSummary(type: string, id: string): Promise<SummaryRow[]> {
  const db = getDb()
  if (type === 'person') {
    const [rates, routing, entries] = await Promise.all([
      db.select().from(s.rateCards).where(eq(s.rateCards.person, id)),
      db.select().from(s.payeeRoutings).where(eq(s.payeeRoutings.person, id)),
      db.select().from(s.timeEntries).where(eq(s.timeEntries.person, id)),
    ])
    const sorted = rates.sort((a, b) => b.month.localeCompare(a.month))
    const current = sorted[0]
    const prior = sorted.find((r) => current && r.rateCents !== current.rateCents)
    const rows: SummaryRow[] = []
    if (current) {
      rows.push({
        label: 'Rate',
        value: `${formatCents(current.rateCents)}/h${prior ? ` (was ${formatCents(prior.rateCents)} ${monthLabel(prior.month)})` : ''}`,
        asOf: `since ${monthLabel(current.month)}`,
      })
    }
    const r0 = routing[0]
    rows.push({ label: 'Routing', value: r0 && r0.mode === 'routed' ? `routed → ${r0.vendor ?? 'vendor'}` : 'paid direct' })
    const now = new Date().toISOString().slice(0, 10)
    const windowStart = now.slice(0, 8) + (Number(now.slice(8, 10)) <= 15 ? '01' : '16')
    const winMinutes = entries.filter((e) => e.enteredOn >= windowStart && e.enteredOn <= now).reduce((a, e) => a + e.minutes, 0)
    const approved = entries.filter((e) => e.enteredOn >= windowStart && e.enteredOn <= now && e.approvalStatus === 'APPROVED').reduce((a, e) => a + e.minutes, 0)
    rows.push({ label: 'This window', value: `${formatHours(winMinutes)} logged · ${formatHours(approved)} approved`, asOf: `since ${windowStart}` })
    return rows
  }
  if (type === 'counterparty') {
    const [cp] = await db.select().from(s.counterparties).where(eq(s.counterparties.id, id))
    if (!cp) return []
    const rels = (await db.select().from(s.relationships)).filter((r) => r.counterpartyId === id)
    const roles = [...new Set(rels.map((r) => r.role))].join(' · ')
    const active = rels.filter((r) => r.status === 'active').length
    return [
      { label: 'Roles', value: roles || '—' },
      { label: 'Relationships', value: `${rels.length} (${active} active)` },
      ...(cp.notes ? [{ label: 'Notes', value: cp.notes }] : []),
    ]
  }
  if (type === 'cycle') {
    const [cyc] = await db.select().from(s.payCycles).where(eq(s.payCycles.id, id))
    if (!cyc) return []
    const lines = (await db.select().from(s.payCycleLines)).filter((l) => l.cycleId === id)
    const payable = lines.filter((l) => l.payable).reduce((a, l) => a + (l.amountCents ?? 0), 0)
    return [
      { label: 'Payable', value: formatCents(payable), asOf: `pays ${cyc.scheduledPayDate}` },
      { label: 'Status', value: cyc.status },
      { label: 'Lines', value: `${lines.filter((l) => l.payable).length} payable · ${lines.filter((l) => !l.payable).length} excluded/deferred` },
    ]
  }
  return []
}
