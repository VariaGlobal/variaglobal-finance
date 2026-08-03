/**
 * Payroll engine — pure, deterministic, side-effect free.
 * Money math lives here and only here (FINANCE-SYSTEM-ARCHITECTURE.md 5.4, 5.16, 5.18).
 * Integer cents everywhere. Same inputs always produce same outputs.
 * No imports from React, no I/O, no Date.now() — fully replayable.
 */

export interface RateEntry {
  person: string
  month: string // 'YYYY-MM'
  rateCentsPerHour: number
  source: string // provenance: rate card cell, or ruling id for backfills
}

export interface RoutingEntry {
  person: string
  mode: 'direct' | 'routed'
  vendor?: string // e.g. 'Interrupt Media' — generic: any vendor works
}

export interface TimeBlock {
  person: string
  minutes: number
  originPeriodStart: string // 'YYYY-MM-DD' — true period of the work
  originPeriodEnd: string
  source: string // provenance: sheet/pivot or Asana export reference
}

export type Instruction =
  | { kind: 'defer'; id: string; person: string; originPeriodStart: string; targetCycleId: string; label: string; evidence?: string }
  | { kind: 'open_ruling'; id: string; person: string; label: string; options: { label: string; minutesDelta: number }[]; decided?: { optionLabel: string; decidedBy: string } }
  | { kind: 'note'; id: string; person: string; originPeriodStart?: string; label: string; evidence?: string }

export interface CycleSpec {
  id: string
  entity: string
  periodStart: string
  periodEnd: string
  scheduledPayDate: string
  actualPayDate?: string
  status: 'paid' | 'to_be_paid'
  time: TimeBlock[]
  instructions: Instruction[]
  approvalWarnings?: { submittedEntries: number; draftEntries: number }
}

export interface EngineContext {
  rates: RateEntry[]
  routings: RoutingEntry[]
}

export interface CycleLine {
  person: string
  minutes: number
  hoursDisplay: string
  rateCentsPerHour: number | null
  rateSource: string | null
  amountCents: number | null
  payable: boolean
  excludedReason?: string
  deferredOut?: { toCycleId: string; rulingId: string }
  deferredIn?: { fromCycleId: string; rulingId: string }
  openRuling?: { id: string; label: string; options: { label: string; amountCents: number }[] }
  originPeriod: string
  notes: string[]
  trace: string
  errors: string[]
}

export interface CycleResult {
  cycleId: string
  status: 'paid' | 'to_be_paid'
  scheduledPayDate: string
  actualPayDate?: string
  lines: CycleLine[]
  payableCents: number // resolved, payable lines only
  vendorAccrualCents: number // routed people — owed via vendors, not payroll
  deferredOutCents: number
  pendingRulingTotals: { label: string; totalCents: number }[] // payable + each open-ruling option
  errors: string[]
  warnings: string[]
}

export function amountCents(minutes: number, rateCentsPerHour: number): number {
  return Math.round((minutes * rateCentsPerHour) / 60)
}

export function formatHours(minutes: number): string {
  const h = minutes / 60
  const s = h.toFixed(2).replace(/\.?0+$/, '')
  return `${s}h`
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const rem = String(abs % 100).padStart(2, '0')
  return `${sign}$${dollars.toLocaleString('en-US')}.${rem}`
}

export function resolveRate(
  ctx: EngineContext,
  person: string,
  month: string,
): { entry: RateEntry } | { error: string } {
  const matches = ctx.rates.filter((r) => r.person === person && r.month === month)
  if (matches.length === 0) return { error: `No rate for ${person} in ${month} — hard stop, needs a ruling` }
  if (new Set(matches.map((m) => m.rateCentsPerHour)).size > 1) {
    return { error: `Ambiguous rate for ${person} in ${month} — hard stop, needs a ruling` }
  }
  return { entry: matches[0] }
}

function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

function buildLine(ctx: EngineContext, block: TimeBlock): CycleLine {
  const month = monthOf(block.originPeriodStart)
  const routing = ctx.routings.find((r) => r.person === block.person)
  const resolved = resolveRate(ctx, block.person, month)
  const errors: string[] = []
  let rate: RateEntry | null = null
  if ('error' in resolved) errors.push(resolved.error)
  else rate = resolved.entry

  const routed = routing?.mode === 'routed'
  const amt = rate ? amountCents(block.minutes, rate.rateCentsPerHour) : null
  const hours = formatHours(block.minutes)
  const trace = rate
    ? `${hours} × ${formatCents(rate.rateCentsPerHour)}/h = ${formatCents(amt as number)}${routed ? ` → accrues to ${routing?.vendor}` : ''}`
    : `${hours} × (unresolved rate)`

  return {
    person: block.person,
    minutes: block.minutes,
    hoursDisplay: hours,
    rateCentsPerHour: rate ? rate.rateCentsPerHour : null,
    rateSource: rate ? rate.source : null,
    amountCents: amt,
    payable: !routed && errors.length === 0,
    excludedReason: routed ? `routed → ${routing?.vendor} (vendor settlement, not payroll)` : undefined,
    originPeriod: `${block.originPeriodStart}..${block.originPeriodEnd}`,
    notes: [],
    trace,
    errors,
  }
}

/** Process all cycles together so deferrals can move lines across cycles deterministically. */
export function runPayroll(specs: CycleSpec[], ctx: EngineContext): CycleResult[] {
  const results = new Map<string, CycleResult>()
  const transfers: { toCycleId: string; fromCycleId: string; line: CycleLine }[] = []

  for (const spec of specs) {
    const lines: CycleLine[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (const block of spec.time) {
      const line = buildLine(ctx, block)

      const defer = spec.instructions.find(
        (i): i is Extract<Instruction, { kind: 'defer' }> =>
          i.kind === 'defer' && i.person === block.person && i.originPeriodStart === block.originPeriodStart,
      )
      if (defer) {
        line.deferredOut = { toCycleId: defer.targetCycleId, rulingId: defer.id }
        line.payable = false
        line.notes.push(`${defer.label}${defer.evidence ? ` — evidence: ${defer.evidence}` : ''}`)
        transfers.push({
          toCycleId: defer.targetCycleId,
          fromCycleId: spec.id,
          line: { ...line, deferredOut: undefined, deferredIn: { fromCycleId: spec.id, rulingId: defer.id }, payable: false, notes: [...line.notes], errors: [...line.errors] },
        })
      }

      const note = spec.instructions.find(
        (i): i is Extract<Instruction, { kind: 'note' }> =>
          i.kind === 'note' &&
          i.person === block.person &&
          (!i.originPeriodStart || i.originPeriodStart === block.originPeriodStart),
      )
      if (note) line.notes.push(`${note.label}${note.evidence ? ` — evidence: ${note.evidence}` : ''}`)

      line.errors.forEach((e) => errors.push(e))
      lines.push(line)
    }

    if (spec.approvalWarnings && (spec.approvalWarnings.submittedEntries > 0 || spec.approvalWarnings.draftEntries > 0)) {
      warnings.push(
        `Contains non-APPROVED time at export: ${spec.approvalWarnings.submittedEntries} SUBMITTED, ${spec.approvalWarnings.draftEntries} DRAFT entries. Target state: only APPROVED time enters payroll.`,
      )
    }

    results.set(spec.id, {
      cycleId: spec.id,
      status: spec.status,
      scheduledPayDate: spec.scheduledPayDate,
      actualPayDate: spec.actualPayDate,
      lines,
      payableCents: 0,
      vendorAccrualCents: 0,
      deferredOutCents: 0,
      pendingRulingTotals: [],
      errors,
      warnings,
    })
  }

  for (const t of transfers) {
    const target = results.get(t.toCycleId)
    if (!target) {
      results.get(t.fromCycleId)?.errors.push(
        `Deferral target cycle "${t.toCycleId}" not found — deferred money for ${t.line.person} has no destination`,
      )
      continue
    }
    const spec = specs.find((s) => s.id === t.toCycleId)
    const ruling = spec?.instructions.find(
      (i): i is Extract<Instruction, { kind: 'open_ruling' }> => i.kind === 'open_ruling' && i.person === t.line.person,
    )
    if (ruling && t.line.rateCentsPerHour !== null) {
      if (ruling.decided) {
        const opt = ruling.options.find((o) => o.label === ruling.decided?.optionLabel)
        if (!opt) {
          t.line.errors.push(`Ruling ${ruling.id} decided with unknown option "${ruling.decided.optionLabel}"`)
          t.line.payable = false
        } else {
          const rate = t.line.rateCentsPerHour as number
          t.line.minutes = t.line.minutes + opt.minutesDelta
          t.line.hoursDisplay = formatHours(t.line.minutes)
          t.line.amountCents = amountCents(t.line.minutes, rate)
          t.line.payable = t.line.errors.length === 0
          t.line.trace = `${t.line.hoursDisplay} × ${formatCents(rate)}/h = ${formatCents(t.line.amountCents)} (${ruling.id} decided: ${opt.label})`
          t.line.notes.push(`${ruling.id} decided by ${ruling.decided.decidedBy}: ${opt.label}`)
        }
      } else {
        t.line.openRuling = {
          id: ruling.id,
          label: ruling.label,
          options: ruling.options.map((o) => ({
            label: o.label,
            amountCents: amountCents(t.line.minutes + o.minutesDelta, t.line.rateCentsPerHour as number),
          })),
        }
      }
    }
    if (!t.line.openRuling && !t.line.payable) {
      target.warnings.push(
        `Deferred-in line for ${t.line.person} has no gating ruling — it is excluded from every total until one exists`,
      )
    }
    target.lines.push(t.line)
  }

  for (const result of results.values()) {
    result.payableCents = result.lines.filter((l) => l.payable).reduce((s, l) => s + (l.amountCents ?? 0), 0)
    result.vendorAccrualCents = result.lines
      .filter((l) => l.excludedReason?.startsWith('routed'))
      .reduce((s, l) => s + (l.amountCents ?? 0), 0)
    result.deferredOutCents = result.lines.filter((l) => l.deferredOut).reduce((s, l) => s + (l.amountCents ?? 0), 0)
    const open = result.lines.filter((l) => l.openRuling)
    if (open.length > 0) {
      result.pendingRulingTotals = open.flatMap((l) =>
        (l.openRuling as NonNullable<CycleLine['openRuling']>).options.map((o) => ({
          label: `${l.person}: ${o.label}`,
          totalCents: result.payableCents + o.amountCents,
        })),
      )
    }
  }

  return specs.map((s) => results.get(s.id) as CycleResult)
}
