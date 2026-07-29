/**
 * Records → People. Every contractor who appears in the real cycles,
 * conforming to lib/types.ts Person. Rates mirror the 2026-07 rate card
 * (with ruling-backfilled June entries noted in real-cycles.ts).
 */

import type { Person } from '@/lib/types'

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
  },
): Person {
  return {
    id,
    name,
    role,
    entity: 'the-matchbox',
    rateHistory: [
      {
        id: `rc-${id}-1`,
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
  person('emily-hill', 'Emily Hill', 'Account management', '$75.00/h'),
  person('harriett-wells', 'Harriett Wells', 'Marketing ops', '$30.00/h'),
  person('kayla-krasnow', 'Kayla Krasnow', 'Strategy', '$75.00/h'),
  person('kirsten-conaster', 'Kirsten Conaster', 'Content', '$40.00/h'),
  person('megan-breyer', 'Megan Breyer', 'Account management', '$75.00/h', {
    effectiveFrom: 'Jun 2026',
  }),
  person('miles-lorentzen', 'Miles Lorentzen', 'Production', '$20.00/h'),
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
