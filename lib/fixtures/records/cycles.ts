/**
 * Records → Pay cycles display models.
 * Derived ONCE at module load from the REAL cycle data via the pure payroll
 * engine (lib/engine/payroll.ts) — components render these display strings
 * verbatim and never do math. June 16–30 paid $11,344.92; Jul 1–15 payable
 * $14,953.08 with one pending-ruling line (RUL-002).
 */

import { runPayroll, formatCents } from '@/lib/engine/payroll'
import { engineContext, realCycleSpecs } from '@/lib/fixtures/real-cycles'

export interface CycleLineDisplay {
  id: string
  personId: string
  personName: string
  hoursDisplay: string
  rateDisplay: string // "$70.00/h" or "—"
  amountDisplay: string // "$3,710.00" or "—"
  originPeriodLabel: string // "Jun 16–30" — true period of the work
  originIsForeign: boolean // origin differs from the cycle period
  state: 'payable' | 'excluded' | 'deferred_out' | 'deferred_in' | 'pending_ruling'
  stateLabel?: string // "routed → Interrupt Media", "deferred to Jul 31 run", …
  notes: string[]
  trace: string
  rulingOptions?: { label: string; amountDisplay: string }[]
}

export interface CycleDisplay {
  id: string
  periodLabel: string // "Jun 16–30"
  monthLabel: string // "Jun 2026"
  entityLabel: string
  status: 'paid' | 'to_be_paid'
  statusLabel: string // "Paid Jul 15" / "To be paid Jul 31"
  payDateLabel: string // "Jul 15" / "Jul 31"
  payableDisplay: string // "$11,344.92"
  vendorAccrualDisplay: string // "$1,375.00"
  peopleCount: number
  excludedCount: number
  pendingRulingCount: number
  warnings: string[]
  lines: CycleLineDisplay[]
}

export function personSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function dayLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}`
}

function periodLabel(startIso: string, endIso: string): string {
  const [, sm, sd] = startIso.split('-').map(Number)
  const [, em, ed] = endIso.split('-').map(Number)
  return sm === em
    ? `${MONTHS[sm - 1]} ${sd}–${ed}`
    : `${MONTHS[sm - 1]} ${sd} – ${MONTHS[em - 1]} ${ed}`
}

const entityLabels: Record<string, string> = {
  'the-matchbox': 'The Matchbox',
  'spyll-world': 'Spyll World',
  'the-ad-spend': 'The Ad Spend',
  'varia-global': 'Varia Global',
}

const results = runPayroll(realCycleSpecs, engineContext)

export const cycles: CycleDisplay[] = results.map((result) => {
  const spec = realCycleSpecs.find((s) => s.id === result.cycleId)!
  const cyclePeriod = periodLabel(spec.periodStart, spec.periodEnd)
  const [year, month] = spec.periodStart.split('-').map(Number)
  const payDay = dayLabel(spec.scheduledPayDate)

  const lines: CycleLineDisplay[] = result.lines.map((line, i) => {
    const origin = line.originPeriod.split('..')
    const originLabel = periodLabel(origin[0], origin[1])
    let state: CycleLineDisplay['state'] = 'payable'
    let stateLabel: string | undefined
    if (line.openRuling) {
      state = 'pending_ruling'
      stateLabel = `pending ruling ${line.openRuling.id}`
    } else if (line.deferredIn) {
      state = 'deferred_in'
      stateLabel = `deferred in from ${line.deferredIn.fromCycleId} · ${line.deferredIn.rulingId}`
    } else if (line.deferredOut) {
      state = 'deferred_out'
      stateLabel = `deferred to ${line.deferredOut.toCycleId} · ${line.deferredOut.rulingId}`
    } else if (line.excludedReason) {
      state = 'excluded'
      stateLabel = line.excludedReason
    }
    return {
      id: `${result.cycleId}-line-${i}`,
      personId: personSlug(line.person),
      personName: line.person,
      hoursDisplay: line.hoursDisplay,
      rateDisplay:
        line.rateCentsPerHour !== null ? `${formatCents(line.rateCentsPerHour)}/h` : '—',
      amountDisplay: line.amountCents !== null ? formatCents(line.amountCents) : '—',
      originPeriodLabel: originLabel,
      originIsForeign: originLabel !== cyclePeriod,
      state,
      stateLabel,
      notes: line.notes,
      trace: line.trace,
      rulingOptions: line.openRuling?.options.map((o) => ({
        label: o.label,
        amountDisplay: formatCents(o.amountCents),
      })),
    }
  })

  return {
    id: result.cycleId,
    periodLabel: cyclePeriod,
    monthLabel: `${MONTHS[month - 1]} ${year}`,
    entityLabel: entityLabels[spec.entity] ?? spec.entity,
    status: result.status,
    statusLabel: result.status === 'paid' ? `Paid ${payDay}` : `To be paid ${payDay}`,
    payDateLabel: payDay,
    payableDisplay: formatCents(result.payableCents),
    vendorAccrualDisplay: formatCents(result.vendorAccrualCents),
    peopleCount: new Set(result.lines.map((l) => l.person)).size,
    excludedCount: result.lines.filter((l) => l.excludedReason).length,
    pendingRulingCount: result.lines.filter((l) => l.openRuling).length,
    warnings: result.warnings,
    lines,
  }
})

/** Most recent first for the hub table. */
export const cyclesNewestFirst: CycleDisplay[] = [...cycles].reverse()
