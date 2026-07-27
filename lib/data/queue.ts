/**
 * REAL queue derivation — work items computed from the payroll engine over the
 * two extracted cycles (no demo data). Components stay dumb: every number and
 * string here is precomputed. Decisions render; persisting them lands with the
 * DB write path (next PR) — until then actions are visible but not durable.
 */

import type { Money, WorkItem } from '@/lib/types'
import { formatCents, runPayroll } from '@/lib/engine/payroll'
import { engineContext, realCycleSpecs } from '@/lib/fixtures/real-cycles'

function money(cents: number): Money {
  return { display: formatCents(cents), cents, currency: 'USD' }
}

export function buildRealWorkItems(): WorkItem[] {
  const [june, july] = runPayroll(realCycleSpecs, engineContext)
  const deferred = june.lines.find((l) => l.deferredOut)
  const pendingFull = july.pendingRulingTotals.find((t) => t.label.includes('full'))
  const pendingMinus = july.pendingRulingTotals.find((t) => t.label.includes('−3h'))

  const items: WorkItem[] = [
    {
      id: 'wi-rul-002',
      type: 'pay_cycle',
      status: 'needs_decision',
      title: 'Resolve split routing — Arsalan, June 16–30',
      meta: ['The Matchbox', 'decide before the Jul 31 run', 'RUL-002'],
      trace: `51.5h × $100.00/h = ${formatCents(515000)} · with −3h via IM = ${formatCents(485000)}`,
      amount: money(deferred?.amountCents ?? 515000),
      actions: [
        {
          id: 'rul2-full',
          label: 'Pay full $5,150.00',
          intent: 'primary',
          money: true,
          resolves: true,
          confirm: {
            title: 'Record ruling RUL-002 — pay in full',
            records: [
              'Arsalan, deferred June 16–30 work: 51.5h × $100.00/h = $5,150.00 pays in the Jul 31 cycle',
              'Nothing moves to Interrupt Media settlement for this line',
              'Ruling recorded with actor and timestamp — reversible only by correction',
            ],
          },
        },
        {
          id: 'rul2-minus3h',
          label: 'Apply −3h via IM',
          intent: 'secondary',
          money: true,
          resolves: true,
          confirm: {
            title: 'Record ruling RUL-002 — apply −3h via Interrupt Media',
            records: [
              'Arsalan, deferred June 16–30 work: 48.5h × $100.00/h = $4,850.00 pays in the Jul 31 cycle',
              '3.0h × $100.00/h = $300.00 accrues to Interrupt Media settlement instead',
              'Ruling recorded with actor and timestamp — reversible only by correction',
            ],
          },
        },
      ],
      evidence: [
        { label: 'Bank evidence', value: 'Mercury (The Matchbox): only $600.00 to Syed Arsalan Raza in Jul 10–27', mono: false },
        { label: 'Mercury txn', value: '9f1d882e-8217-11f1-a4d1-a34b61ec221a', mono: true },
        { label: 'Sheet note', value: '"Subtract 3 hours paid directly to IM" — June F4 / July F13, never applied by any formula', mono: false },
        { label: 'Option A', value: '51.5h × $100.00 = $5,150.00 → Jul 31 total $20,103.08', mono: true },
        { label: 'Option B', value: '48.5h × $100.00 = $4,850.00 → Jul 31 total $19,803.08', mono: true },
      ],
      history: [
        { at: 'Jul 27, 13:26', actor: 'Mercury', event: 'Evidence pulled: single $600.00 payment, memo "June 1 through 15 2026 payroll"' },
        { at: 'Jul 27', actor: 'Ani Bisaria', event: 'RUL-001 recorded: $5,150.00 deferred from the Jul 15 run to Jul 31' },
        { at: 'Jul 27', actor: 'System', event: 'Deferred-in line gated on this ruling (RUL-002)' },
      ],
      tags: { entity: 'the-matchbox', people: ['arsalan'], period: '2026-07', status: 'needs_decision' },
      createdAt: 'Jul 27',
    },
    {
      id: 'wi-cycle-2026-07-h1',
      type: 'pay_cycle',
      status: 'prepared',
      title: 'Pay cycle Jul 1–15 — ready for review',
      meta: ['The Matchbox', 'pays Jul 31', '9 direct · 1 routed → IM', '1 deferred-in pending RUL-002'],
      trace: `${formatCents(july.payableCents)} payable · Jul 31 total ${pendingFull ? formatCents(pendingFull.totalCents) : ''} full / ${pendingMinus ? formatCents(pendingMinus.totalCents) : ''} with −3h`,
      amount: money(july.payableCents),
      actions: [
        { id: 'cycle-review', label: 'Review lines', intent: 'secondary', money: false, resolves: false },
        {
          id: 'cycle-approve',
          label: 'Approve & freeze',
          intent: 'primary',
          money: true,
          resolves: false,
          confirm: {
            title: 'Approve pay cycle Jul 1–15 (requires RUL-002 decided)',
            records: [
              `Freezes 9 payable lines totaling ${formatCents(july.payableCents)}, plus the RUL-002 outcome`,
              'Every line pins its Rate Card 2026-07 version — post-approval changes only by correction',
              'Tess Fazio 11.75h excluded from payroll — accrues $1,468.75 to Interrupt Media settlement',
            ],
          },
        },
      ],
      evidence: [
        { label: 'Engine', value: 'replay verified: 7 checks + 3 invariants, diff $0.00 vs sheets', mono: false },
        { label: 'Verify live', value: '/api/dev/replay', mono: true },
        { label: 'Approval hygiene', value: '31 SUBMITTED Asana entries inside this period (see queue item)', mono: false },
      ],
      history: [
        { at: 'Jul 27', actor: 'System', event: 'Cycle computed from Asana export minutes × Rate Card 2026-07' },
        { at: 'Jul 27', actor: 'Review agent', event: 'Adversarial review: 24/24 amounts reproduced exactly' },
      ],
      tags: { entity: 'the-matchbox', period: '2026-07', status: 'prepared' },
      createdAt: 'Jul 27',
    },
    {
      id: 'wi-approval-hygiene',
      type: 'pay_cycle',
      status: 'review',
      title: 'Non-approved time is flowing into payroll',
      meta: ['Asana', 'June cycle: 36 SUBMITTED + 5 DRAFT (already paid)', 'July cycle: 31 SUBMITTED'],
      actions: [{ id: 'hyg-review', label: 'Review in Asana', intent: 'secondary', money: false, resolves: false }],
      evidence: [
        { label: 'Rule', value: 'Target state: only APPROVED time enters payroll or billing', mono: false },
        { label: 'June 16–30', value: '36 SUBMITTED + 5 DRAFT entries of 458 were paid Jul 15', mono: true },
        { label: 'Jul 1–15', value: '31 SUBMITTED entries of 462 are in the prepared cycle', mono: true },
      ],
      history: [{ at: 'Jul 27', actor: 'System', event: 'Detected during cycle extraction — enforcement lands with live Asana ingestion' }],
      tags: { entity: 'the-matchbox', period: '2026-07', status: 'review' },
      createdAt: 'Jul 27',
    },
    {
      id: 'wi-im-accrual',
      type: 'invoice_variance',
      status: 'review',
      title: 'Expected Interrupt Media invoice — Tess Fazio',
      meta: ['Jun 16 – Jul 15', 'routed via Interrupt Media', '$125.00/h client rate'],
      trace: `${formatCents(june.vendorAccrualCents)} + ${formatCents(july.vendorAccrualCents)} = ${formatCents(june.vendorAccrualCents + july.vendorAccrualCents)} accrued`,
      amount: money(june.vendorAccrualCents + july.vendorAccrualCents),
      actions: [
        {
          id: 'im-record',
          label: 'Record invoice received',
          intent: 'secondary',
          money: true,
          resolves: false,
          requiresReason: false,
          confirm: {
            title: 'Record an Interrupt Media invoice against this accrual',
            records: [
              'Matches invoice lines against accrued 11h (June) + 11.75h (July) at $125.00/h',
              'Variance beyond $0.00 opens a dispute item automatically',
            ],
          },
        },
      ],
      evidence: [
        { label: 'June 16–30', value: '11h × $125.00 = $1,375.00 (IM_TMB Master corroborates)', mono: true },
        { label: 'Jul 1–15', value: '11.75h × $125.00 = $1,468.75 (IM_TMB Master corroborates)', mono: true },
        { label: 'Pattern', value: 'Vendor routing is generic — same mechanism for any future pass-through vendor', mono: false },
      ],
      history: [{ at: 'Jul 27', actor: 'System', event: 'Accrual computed from routed time — awaiting IM invoice' }],
      tags: { entity: 'the-matchbox', people: ['tess-fazio'], period: '2026-07', status: 'review' },
      createdAt: 'Jul 27',
    },
    {
      id: 'wi-june-verified',
      type: 'bank_match',
      status: 'review',
      title: `June 16–30 replay verified — paid ${formatCents(june.payableCents)}`,
      meta: ['The Matchbox', 'Jul 15 run (straggler paid Jul 21)', 'engine vs sheet: diff $0.00'],
      amount: money(june.payableCents),
      actions: [{ id: 'june-replay', label: 'View replay', intent: 'secondary', money: false, resolves: false }],
      evidence: [
        { label: 'Reconciliation', value: 'Sheet grand total $16,494.92 − deferred $5,150.00 = $11,344.92 paid', mono: true },
        { label: 'Straggler', value: 'Arsalan June 1–15 catch-up $600.00 — actually paid Jul 21 (Mercury)', mono: false },
        { label: 'Zach Crew', value: '$15.00/h backfilled by ruling RUL-003 (absent from Rate Card)', mono: false },
      ],
      history: [
        { at: 'Jul 27', actor: 'System', event: 'Cycle reconstructed and reconciled to the cent' },
        { at: 'Jul 27', actor: 'Ani Bisaria', event: 'Rulings RUL-001, RUL-003, RUL-004 recorded' },
      ],
      tags: { entity: 'the-matchbox', period: '2026-06', status: 'review' },
      createdAt: 'Jul 27',
    },
  ]

  return items
}
