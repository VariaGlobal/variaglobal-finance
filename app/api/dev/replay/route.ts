import { NextResponse } from 'next/server'
import { formatCents, runPayroll } from '@/lib/engine/payroll'
import { engineContext, realCycleSpecs, sheetExpectations } from '@/lib/fixtures/real-cycles'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/replay — the parallel-run proof (FINANCE-SYSTEM-ARCHITECTURE.md 5.18 #6).
 * Recomputes the two most recent pay cycles from raw minutes + rate card and
 * reconciles against the spreadsheet's own totals. Every diff must be explained.
 * Read-only; fixtures in, JSON out; no database, no AI, no writes.
 */

interface Check {
  id: string
  label: string
  expected: string
  actual: string
  diffCents: number
  pass: boolean
  explanation: string
}

function cents(dollars: number): number {
  return Math.round(dollars * 100)
}

function check(id: string, label: string, expectedCents: number, actualCents: number, explanation: string, toleranceCents = 1): Check {
  const diff = actualCents - expectedCents
  return {
    id,
    label,
    expected: formatCents(expectedCents),
    actual: formatCents(actualCents),
    diffCents: diff,
    pass: Math.abs(diff) <= toleranceCents,
    explanation,
  }
}

export async function GET() {
  const run1 = runPayroll(realCycleSpecs, engineContext)
  const run2 = runPayroll(realCycleSpecs, engineContext)
  const june = run1[0]
  const july = run1[1]
  const sheets = sheetExpectations

  const checks: Check[] = [
    check(
      'JUNE-PAYABLE',
      'June 16–30 payable = sheet grand total minus the deferred $5,150 (RUL-001)',
      cents(sheets.june.grandTotalE16) - cents(sheets.june.arsalanDeferred),
      june.payableCents,
      'Sheet E16 ($16,494.92, hardcoded) included Arsalan 51.5h that Mercury proves was never paid Jul 15. Engine records it as deferred-out, so payable = E16 − $5,150.',
    ),
    check(
      'JUNE-PIVOT',
      'June pivot reconstruction matches sheet E15',
      cents(sheets.june.pivotTotalE15),
      june.payableCents - 60000 + june.deferredOutCents,
      'payable − $600 straggler + $5,150 deferred = the sheet pivot sum (E15). Sub-cent drift is the sheet carrying unrounded thirds of a cent; engine rounds each line to the cent.',
    ),
    check(
      'JUNE-VENDOR',
      'June vendor accrual (Tess → Interrupt Media)',
      cents(sheets.june.tessVendorAccrual),
      june.vendorAccrualCents,
      '11h × $125 — excluded from payroll, owed via vendor settlement; corroborated by the IM_TMB Master sheet.',
      0,
    ),
    check(
      'JULY-PAYABLE',
      'July 1–15 payable = sheet E12 + decided RUL-002 ($4,850.00)',
      cents(sheets.july.pivotTotalE12) + cents(sheets.july.deferredInMinus3h),
      july.payableCents,
      'RUL-002 decided 2026-07-30 (Sydney Allen): deferred June work pays 48.5h × $100 = $4,850.00 direct; 3.0h settle via the Interrupt Media invoice.',
    ),
    check(
      'JULY-VENDOR',
      'July vendor accrual (Tess → Interrupt Media)',
      cents(sheets.july.tessVendorAccrual),
      july.vendorAccrualCents,
      '11.75h × $125 — corroborated by the IM_TMB Master sheet.',
      0,
    ),
    check(
      'JULY-DECIDED',
      'Deferred-in line pays exactly $4,850.00 per decided RUL-002',
      cents(sheets.july.deferredInMinus3h),
      july.lines.find((l) => l.deferredIn)?.amountCents ?? -1,
      'One-off per Sydney Allen: Arsalan no longer logs time with IM; the $300.00 remainder rides the latest IM invoice.',
      0,
    ),
    check(
      'JULY-NO-PENDING',
      'No pending ruling totals remain on the cycle',
      0,
      july.pendingRulingTotals.length,
      'All rulings decided — the cycle is approvable.',
      0,
    ),
  ]

  const rateErrors = [...june.errors, ...july.errors]
  const deterministic = JSON.stringify(run1) === JSON.stringify(run2)

  const structural = [
    { id: 'RATES-RESOLVE', label: 'Every line resolves exactly one rate (no ambiguity, no gaps)', pass: rateErrors.length === 0, detail: rateErrors.join('; ') || 'ok — includes RUL-003/RUL-004 backfills' },
    { id: 'DETERMINISM', label: 'Same inputs → same outputs (two runs, byte-identical)', pass: deterministic, detail: deterministic ? 'ok' : 'NONDETERMINISM DETECTED' },
    { id: 'DEFERRAL-CONSERVATION', label: 'Deferred money leaves June and arrives in July exactly once', pass: june.deferredOutCents === 515000 && july.lines.filter((l) => l.deferredIn).length === 1, detail: `deferred out ${formatCents(june.deferredOutCents)}; deferred-in lines in July: ${july.lines.filter((l) => l.deferredIn).length}` },
  ]

  const allPass = checks.every((c) => c.pass) && structural.every((s) => s.pass)

  return NextResponse.json({
    verdict: allPass ? 'PASS — engine reconciles to the sheets, every diff explained' : 'FAIL — see failing checks',
    generated: 'deterministic replay of fixtures; timestamps intentionally absent',
    checks,
    structural,
    warnings: [...june.warnings, ...july.warnings],
    openRulings: july.lines.filter((l) => l.openRuling).map((l) => ({ person: l.person, ...(l.openRuling as object) })),
    cycles: run1.map((c) => ({
      cycleId: c.cycleId,
      status: c.status,
      scheduledPayDate: c.scheduledPayDate,
      payable: formatCents(c.payableCents),
      vendorAccrual: formatCents(c.vendorAccrualCents),
      deferredOut: formatCents(c.deferredOutCents),
      pendingRulingTotals: c.pendingRulingTotals.map((t) => ({ label: t.label, total: formatCents(t.totalCents) })),
      lines: c.lines.map((l) => ({
        person: l.person,
        hours: l.hoursDisplay,
        amount: l.amountCents === null ? null : formatCents(l.amountCents),
        payable: l.payable,
        excludedReason: l.excludedReason,
        deferredOut: l.deferredOut,
        deferredIn: l.deferredIn,
        openRuling: l.openRuling ? l.openRuling.label : undefined,
        originPeriod: l.originPeriod,
        trace: l.trace,
        notes: l.notes,
        rateSource: l.rateSource,
      })),
    })),
  })
}
