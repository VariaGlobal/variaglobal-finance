/**
 * Records → People. Every contractor who appears in the real cycles,
 * conforming to lib/types.ts Person. Rates mirror the 2026-07 rate card
 * (with ruling-backfilled June entries noted in real-cycles.ts).
 * Rate histories carry prior entries where raises are on record.
 */

import type { Person, RateCard } from '@/lib/types'

function person(
  id: string,
  name: string,
  role: string,
  rateDisplay: string,
  opts?: {
    routedVia?: string
    clientRateDisplay?: string
    w9Missing?: boolean
    effectiveFrom?: string
    priorRates?: { rateDisplay: string; effectiveFrom: string; effectiveTo: string }[]
  },
): Person {
  const prior: RateCard[] = (opts?.priorRates ?? []).map((r, i) => ({
    id: `rc-${id}-prior-${i}`,
    personId: id,
    rateDisplay: r.rateDisplay,
    effectiveFrom: r.effectiveFrom,
    effectiveTo: r.effectiveTo,
  }))
  return {
    id,
    name,
    role,
    entity: 'the-matchbox',
    rateHistory: [
      ...prior,
      {
        id: `rc-${id}-current`,
        personId: id,
        rateDisplay,
        effectiveFrom: opts?.effectiveFrom ?? 'Jun 2026',
      },
    ],
    routing: opts?.routedVia
      ? {
          personId: id,
          mode: 'routed',
          routedVia: opts.routedVia,
          clientRateDisplay: opts.clientRateDisplay,
        }
      : { personId: id, mode: 'direct' },
    complianceDocs: [
      { kind: 'NDA', status: 'signed' },
      { kind: 'W-9', status: opts?.w9Missing ? 'missing' : 'signed' },
    ],
  }
}

export const recordPeople: Person[] = [
  person('abdullah-siddiqui', 'Abdullah Siddiqui', 'Engineering', '$70.00/h'),
  person('aditya-vyavahare', 'Aditya Vyavahare', 'Design', '$30.00/h'),
  person('arsalan', 'Arsalan', 'HubSpot ops', '$100.00/h'),
  person('desiree-clark', 'Desirée Clark', 'Content', '$20.00/h'),
  person('emily-hill', 'Emily Hill', 'Account management', '$75.00/h', {
    priorRates: [{ rateDisplay: '$60.00/h', effectiveFrom: 'Apr 2026', effectiveTo: 'May 2026' }],
  }),
  person('harriett-wells', 'Harriett Wells', 'Marketing ops', '$30.00/h'),
  person('kayla-krasnow', 'Kayla Krasnow', 'Strategy', '$75.00/h', {
    effectiveFrom: 'Jun 2026 (RUL-004 backfill)',
  }),
  person('kirsten-conaster', 'Kirsten Conaster', 'Content', '$40.00/h'),
  person('megan-breyer', 'Megan Breyer', 'Account management', '$75.00/h', {
    effectiveFrom: 'Jun 2026',
    priorRates: [
      { rateDisplay: '$55.00/h', effectiveFrom: 'Jan 2026', effectiveTo: 'Feb 2026' },
      { rateDisplay: '$65.00/h', effectiveFrom: 'Mar 2026', effectiveTo: 'May 2026' },
    ],
  }),
  person('miles-lorentzen', 'Miles Lorentzen', 'Production', '$20.00/h', {
    effectiveFrom: 'Jun 2026 (RUL-004 backfill)',
  }),
  person('sydney-allen', 'Sydney Allen', 'Finance', '$60.00/h'),
  person('tess-fazio', 'Tess Fazio', 'Marketing ops', '$125.00/h', {
    routedVia: 'Interrupt Media',
    clientRateDisplay: '$125.00/h',
    w9Missing: true,
  }),
  person('zach-crew', 'Zach Crew', 'Production support', '$15.00/h', {
    effectiveFrom: 'Jun 2026 (RUL-003 backfill)',
  }),
]

/* ── Compensation adjustments (profile → Compensation tab) ──────────── */

export interface CompAdjustment {
  label: string
  amountDisplay: string
  asOf: string
}

/** On-record adjustments outside the standard hours × rate lines. */
export const compAdjustments: Record<string, CompAdjustment[]> = {
  arsalan: [
    { label: 'Jun 1–15 catch-up · 6h @ $100.00/h', amountDisplay: '$600.00', asOf: 'paid Jul 21 · Mercury' },
    { label: 'Deferred 51.5h out of Jun 16–30', amountDisplay: '$5,150.00', asOf: 'RUL-001 · pending RUL-002' },
  ],
  'zach-crew': [
    { label: 'Rate card backfilled — tab only', amountDisplay: '$300.00', asOf: 'RUL-003 · Jun 16–30' },
  ],
  'kayla-krasnow': [
    { label: 'Jun rate card entry backfilled', amountDisplay: '—', asOf: 'RUL-004' },
  ],
  'miles-lorentzen': [
    { label: 'Jun rate card entry backfilled', amountDisplay: '—', asOf: 'RUL-004' },
  ],
}
