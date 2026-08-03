/**
 * REAL payroll data — the two most recent cycles, extracted cell-by-cell from
 * CONTRACTOR PAYOUT TRACKER.xlsx + Varia_Finance Dashboard Data_RAW.xlsx
 * (extraction 2026-07-27, cross-verified against Asana exports to the minute).
 *
 * Phase-0 rulings baked in (each recorded with provenance):
 *  RUL-001  Arsalan's June 16–30 51.5h ($5,150) was NOT paid in the Jul 15 run —
 *           Mercury (The Matchbox) shows only $600 to Syed Arsalan Raza on Jul 21
 *           (txn 9f1d882e-8217-11f1-a4d1-a34b61ec221a, memo: June 1–15, 6h @ $100).
 *           Ruling (Ani, 2026-07-27): deferred to the Jul 31 cycle.
 *  RUL-002  "Subtract 3 hours paid directly to IM" (sheet note, June F4 / July F13).
 *           DECIDED 2026-07-30 by Sydney Allen (Slack, relayed by Ani): apply −3h —
 *           $4,850.00 pays direct; $300.00 settles via the latest Interrupt Media
 *           invoice. One-off; Arsalan no longer logs time with IM.
 *  RUL-003  Zach Crew is absent from the Rate Card both months; $15/h exists only
 *           on the June cycle tab. Ruling: tab rate is truth, backfilled.
 *  RUL-004  Abdullah, Kayla, Miles are absent from the 2026-06 Rate Card though
 *           paid in June; their 2026-07 card rates match what the tab used.
 *           Ruling: backfilled June entries from the July card.
 */

import type { CycleSpec, EngineContext, RateEntry } from '@/lib/engine/payroll'

const JUN = '2026-06'
const JUL = '2026-07'

function rate(person: string, month: string, dollarsPerHour: number, source: string): RateEntry {
  return { person, month, rateCentsPerHour: Math.round(dollarsPerHour * 100), source }
}

export const engineContext: EngineContext = {
  rates: [
    rate('Abdullah Siddiqui', JUN, 70, 'RUL-004 backfill from 2026-07 card'),
    rate('Aditya Vyavahare', JUN, 30, 'Rate Card 2026-06'),
    rate('Arsalan', JUN, 100, 'Rate Card 2026-06'),
    rate('Desirée Clark', JUN, 20, 'Rate Card 2026-06'),
    rate('Emily Hill', JUN, 75, 'Rate Card 2026-06'),
    rate('Harriett Wells', JUN, 30, 'Rate Card 2026-06'),
    rate('Kayla Krasnow', JUN, 75, 'RUL-004 backfill from 2026-07 card'),
    rate('Kirsten Conaster', JUN, 40, 'Rate Card 2026-06'),
    rate('Megan Breyer', JUN, 75, 'Rate Card 2026-06'),
    rate('Miles Lorentzen', JUN, 20, 'RUL-004 backfill from 2026-07 card'),
    rate('Sydney Allen', JUN, 60, 'Rate Card 2026-06'),
    rate('Tess Fazio', JUN, 125, 'Rate Card 2026-06 (IM-side bill rate)'),
    rate('Zach Crew', JUN, 15, 'RUL-003 backfill (June cycle tab only)'),
    rate('Abdullah Siddiqui', JUL, 70, 'Rate Card 2026-07'),
    rate('Aditya Vyavahare', JUL, 30, 'Rate Card 2026-07'),
    rate('Arsalan', JUL, 100, 'Rate Card 2026-07'),
    rate('Emily Hill', JUL, 75, 'Rate Card 2026-07'),
    rate('Harriett Wells', JUL, 30, 'Rate Card 2026-07'),
    rate('Kayla Krasnow', JUL, 75, 'Rate Card 2026-07'),
    rate('Megan Breyer', JUL, 75, 'Rate Card 2026-07'),
    rate('Miles Lorentzen', JUL, 20, 'Rate Card 2026-07'),
    rate('Sydney Allen', JUL, 60, 'Rate Card 2026-07'),
    rate('Tess Fazio', JUL, 125, 'Rate Card 2026-07 (IM-side bill rate)'),
  ],
  routings: [
    { person: 'Tess Fazio', mode: 'routed', vendor: 'Interrupt Media' },
    // Everyone else defaults to direct; add rows here as more vendors appear
    // (JD Tech, Matt, …) — the mechanism is generic, not IM-specific.
  ],
}

export const realCycleSpecs: CycleSpec[] = [
  {
    id: '2026-06-H2',
    entity: 'the-matchbox',
    periodStart: '2026-06-16',
    periodEnd: '2026-06-30',
    scheduledPayDate: '2026-07-15',
    status: 'paid',
    approvalWarnings: { submittedEntries: 36, draftEntries: 5 },
    time: [
      { person: 'Abdullah Siddiqui', minutes: 3180, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Aditya Vyavahare', minutes: 821, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Arsalan', minutes: 3090, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" row 4 (sheet note F4)' },
      { person: 'Desirée Clark', minutes: 672, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Emily Hill', minutes: 1290, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Harriett Wells', minutes: 2150, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Kayla Krasnow', minutes: 90, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Kirsten Conaster', minutes: 60, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Megan Breyer', minutes: 1559, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Miles Lorentzen', minutes: 2270, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Sydney Allen', minutes: 555, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" / Asana Export June 16-30' },
      { person: 'Tess Fazio', minutes: 660, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" row 13 (rate cell "IM"); IM_TMB June: 11h @ $125' },
      { person: 'Zach Crew', minutes: 1200, originPeriodStart: '2026-06-16', originPeriodEnd: '2026-06-30', source: 'tab "June 16-30 tbp July 15" row 14 ($15/h on tab only)' },
      { person: 'Arsalan', minutes: 360, originPeriodStart: '2026-06-01', originPeriodEnd: '2026-06-15', source: 'tab "June 16-30 tbp July 15" straggler row 17 (literal name)' },
    ],
    instructions: [
      {
        kind: 'defer',
        id: 'RUL-001',
        person: 'Arsalan',
        originPeriodStart: '2026-06-16',
        targetCycleId: '2026-07-H1',
        label: 'Deferred to Jul 31 run — not paid Jul 15 (ruling: Ani, 2026-07-27)',
        evidence: 'Mercury (The Matchbox): only $600 to Syed Arsalan Raza in Jul 10–27 window, txn 9f1d882e-8217-11f1-a4d1-a34b61ec221a',
      },
      {
        kind: 'note',
        id: 'NOTE-001',
        person: 'Arsalan',
        originPeriodStart: '2026-06-01',
        label: 'June 1–15 catch-up: scheduled with Jul 15 run, actually paid Jul 21',
        evidence: 'Mercury txn 9f1d882e-8217-11f1-a4d1-a34b61ec221a ($600, memo "June 1 through 15 2026 payroll 6 hours at 100USD per hour")',
      },
    ],
  },
  {
    id: '2026-07-H1',
    entity: 'the-matchbox',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-15',
    scheduledPayDate: '2026-07-31',
    status: 'to_be_paid',
    approvalWarnings: { submittedEntries: 31, draftEntries: 0 },
    time: [
      { person: 'Abdullah Siddiqui', minutes: 2925, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Aditya Vyavahare', minutes: 988, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Arsalan', minutes: 2190, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Emily Hill', minutes: 1390, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Harriett Wells', minutes: 2048, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Kayla Krasnow', minutes: 1165, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Megan Breyer', minutes: 1650, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Miles Lorentzen', minutes: 1504, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Sydney Allen', minutes: 615, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" / Asana Export July 1-15' },
      { person: 'Tess Fazio', minutes: 705, originPeriodStart: '2026-07-01', originPeriodEnd: '2026-07-15', source: 'tab "July 1-15 tbp July 31" row 11 (rate cell "IM"); IM_TMB July: 11.75h @ $125' },
    ],
    instructions: [
      {
        kind: 'open_ruling',
        id: 'RUL-002',
        person: 'Arsalan',
        label: 'Sheet note "Subtract 3 hours paid directly to IM" was never applied — pick one before the Jul 31 run',
        options: [
          { label: 'Pay full 51.5h ($5,150.00)', minutesDelta: 0 },
          { label: 'Apply −3h via Interrupt Media ($4,850.00)', minutesDelta: -180 },
        ],
        decided: { optionLabel: 'Apply −3h via Interrupt Media ($4,850.00)', decidedBy: 'Sydney Allen (Slack, relayed by Ani Bisaria, 2026-07-30)' },
      },
    ],
  },
]

/** Sheet values the engine must reconcile against, verbatim from the workbook. */
export const sheetExpectations = {
  june: {
    pivotTotalE15: 15894.9166667, // =SUM(E2:E14), pivot rows only (excludes straggler; Tess IM row is blank)
    grandTotalE16: 16494.92, // hardcoded literal on the tab (= E15 + $600 straggler, typed 0.0033 high)
    tessVendorAccrual: 1375.0, // 11h × $125 — corroborated by IM_TMB Master "June 2026"
    arsalanDeferred: 5150.0, // 51.5h × $100 — in the tab totals but NOT actually paid (RUL-001)
  },
  july: {
    pivotTotalE12: 14953.0833333, // =sum(E2:E10) — excludes IM row and the straggler row below it
    tessVendorAccrual: 1468.75, // 11.75h × $125 — corroborated by IM_TMB Master "July 2026"
    deferredInFull: 5150.0,
    deferredInMinus3h: 4850.0,
  },
} as const
