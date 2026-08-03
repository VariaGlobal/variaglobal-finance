import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db/client'
import * as s from '@/db/schema'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/integrity?key=<BOOTSTRAP_TOKEN>
 * Read-only invariant audit of everything stored in Neon. Reports duplicates,
 * orphans, rate ambiguity, sum drift, and rule violations. Writes nothing.
 * Run it any time; wire it to a cron later as the drift alarm.
 */

interface Check {
  id: string
  pass: boolean
  detail: string
}

export async function GET(req: Request) {
  const token = process.env.BOOTSTRAP_TOKEN
  if (!token) return NextResponse.json({ error: 'BOOTSTRAP_TOKEN is not set on this deployment' }, { status: 503 })
  if (new URL(req.url).searchParams.get('key') !== token) {
    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 401 })
  }
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 503 })

  const db = getDb()
  const checks: Check[] = []
  const add = (id: string, pass: boolean, detail: string) => checks.push({ id, pass, detail })

  const tables = [
    'people',
    'rate_cards',
    'payee_routings',
    'pay_cycles',
    'pay_cycle_lines',
    'rulings',
    'audit_events',
    'counterparties',
    'counterparty_aliases',
    'relationships',
    'relationship_roles',
    'stream_types',
    'expense_categories',
    'time_entries',
    'bank_transactions',
    'sync_runs',
    'transaction_categorizations',
  ]
  const counts: Record<string, number> = {}
  for (const t of tables) {
    try {
      const r = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${t}`))
      counts[t] = Number((r.rows[0] as { n: number | string }).n)
    } catch {
      counts[t] = -1
    }
  }
  const missing = tables.filter((t) => counts[t] === -1)
  add(
    'TABLES-EXIST',
    missing.length === 0,
    missing.length === 0 ? `all ${tables.length} tables present` : `missing: ${missing.join(', ')} — run /api/dev/bootstrap first`,
  )

  if (missing.length === 0) {
    const lines = await db.select().from(s.payCycleLines)
    const cycles = await db.select().from(s.payCycles)
    const rates = await db.select().from(s.rateCards)
    const people = await db.select().from(s.people)
    const rulings = await db.select().from(s.rulings)
    const aliases = await db.select().from(s.counterpartyAliases)
    const counterparties = await db.select().from(s.counterparties)
    const relationships = await db.select().from(s.relationships)

    const lineKey = (l: (typeof lines)[number]) => [l.cycleId, l.person, l.originStart, l.deferredFrom ?? ''].join('|')
    const seen = new Map<string, number>()
    for (const l of lines) seen.set(lineKey(l), (seen.get(lineKey(l)) ?? 0) + 1)
    const dupLines = [...seen.entries()].filter(([, n]) => n > 1)
    add('NO-DUPLICATE-LINES', dupLines.length === 0, dupLines.length === 0 ? `${lines.length} lines, all unique by natural key` : `duplicates: ${dupLines.map(([k, n]) => `${k} ×${n}`).join('; ')}`)

    const cycleIds = new Set(cycles.map((c) => c.id))
    const orphanLines = lines.filter((l) => !cycleIds.has(l.cycleId))
    add('NO-ORPHAN-LINES', orphanLines.length === 0, orphanLines.length === 0 ? 'every line belongs to an existing cycle' : `${orphanLines.length} lines reference missing cycles`)

    const personNames = new Set(people.map((p) => p.name))
    const unknownPeople = [...new Set(lines.filter((l) => !personNames.has(l.person)).map((l) => l.person))]
    add('PEOPLE-RESOLVE', unknownPeople.length === 0, unknownPeople.length === 0 ? 'every line person exists in people' : `unknown: ${unknownPeople.join(', ')}`)

    const rateGroups = new Map<string, Set<number>>()
    for (const r of rates) {
      const k = `${r.person}|${r.month}`
      if (!rateGroups.has(k)) rateGroups.set(k, new Set())
      ;(rateGroups.get(k) as Set<number>).add(r.rateCents)
    }
    const ambiguous = [...rateGroups.entries()].filter(([, v]) => v.size > 1)
    add('NO-RATE-AMBIGUITY', ambiguous.length === 0, ambiguous.length === 0 ? `${rates.length} rate rows, one rate per person-month` : `ambiguous: ${ambiguous.map(([k]) => k).join('; ')}`)

    const junePayable = lines.filter((l) => l.cycleId === '2026-06-H2' && l.payable).reduce((a, l) => a + (l.amountCents ?? 0), 0)
    const julyPayable = lines.filter((l) => l.cycleId === '2026-07-H1' && l.payable).reduce((a, l) => a + (l.amountCents ?? 0), 0)
    add('JUNE-SUM', junePayable === 1134492, `June payable ${junePayable} cents (expect 1134492 = $11,344.92)`)
    add('JULY-SUM', julyPayable === 1980308, `July payable ${julyPayable} cents (expect 1980308 = $19,803.08 — includes decided RUL-002 at $4,850.00)`)

    const deferredIn = lines.filter((l) => l.deferredFrom !== null)
    add('DEFERRAL-ONCE', deferredIn.length === 1 && deferredIn[0].cycleId === '2026-07-H1', `${deferredIn.length} deferred-in lines (expect exactly 1, in 2026-07-H1)`)

    const badPayable = lines.filter((l) => l.payable && (l.amountCents === null || l.rateCents === null))
    add('PAYABLE-COMPLETE', badPayable.length === 0, badPayable.length === 0 ? 'every payable line has rate and amount' : `${badPayable.length} payable lines missing rate/amount`)

    const badExcluded = lines.filter((l) => l.excludedReason !== null && l.payable)
    add('EXCLUDED-NOT-PAYABLE', badExcluded.length === 0, badExcluded.length === 0 ? 'excluded lines are never payable' : `${badExcluded.length} excluded lines marked payable`)

    const rul2 = rulings.find((r) => r.id === 'RUL-002')
    const badDecided = rulings.filter((r) => r.status === 'decided' && !r.decidedBy)
    add('RULINGS-SOUND', Boolean(rul2) && badDecided.length === 0, `RUL-002 ${rul2 ? rul2.status : 'MISSING'}; ${badDecided.length} decided rulings missing decidedBy`)

    const cpIds = new Set(counterparties.map((c) => c.id))
    const orphanAliases = aliases.filter((a) => !cpIds.has(a.counterpartyId))
    const orphanRels = relationships.filter((r) => !cpIds.has(r.counterpartyId))
    add('COUNTERPARTY-GRAPH', orphanAliases.length === 0 && orphanRels.length === 0, `${counterparties.length} counterparties, ${relationships.length} relationships, ${aliases.length} aliases; orphans: ${orphanAliases.length + orphanRels.length}`)

    add('AUDIT-TRAIL', counts.audit_events > 0, `${counts.audit_events} audit events`)
  }

  const clean = checks.every((c) => c.pass)
  return NextResponse.json({
    clean,
    verdict: clean ? 'CLEAN — every record stored once, every sum exact, every link resolves' : 'ISSUES FOUND — see failing checks',
    counts,
    checks,
    ranAt: new Date().toISOString(),
  })
}
