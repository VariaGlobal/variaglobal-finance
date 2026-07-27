import type { Person } from '@/lib/types'

export const people: Person[] = [
  {
    id: 'megan-breyer',
    name: 'Megan Breyer',
    role: 'Account manager',
    entity: 'the-matchbox',
    rateHistory: [
      { id: 'rc-megan-1', personId: 'megan-breyer', rateDisplay: '$50.00/h', effectiveFrom: 'Jan 2026', effectiveTo: 'Apr 2026' },
      { id: 'rc-megan-2', personId: 'megan-breyer', rateDisplay: '$60.00/h', effectiveFrom: 'Apr 2026', effectiveTo: 'Jun 2026' },
      { id: 'rc-megan-3', personId: 'megan-breyer', rateDisplay: '$75.00/h', effectiveFrom: 'Jun 2026' },
    ],
    routing: { personId: 'megan-breyer', mode: 'direct' },
    complianceDocs: [
      { kind: 'NDA', status: 'signed' },
      { kind: 'W-9', status: 'signed' },
    ],
  },
  {
    id: 'tess-fazio',
    name: 'Tess Fazio',
    role: 'Marketing ops',
    entity: 'the-matchbox',
    rateHistory: [
      { id: 'rc-tess-1', personId: 'tess-fazio', rateDisplay: '$125.00/h', effectiveFrom: 'Feb 2026' },
    ],
    routing: {
      personId: 'tess-fazio',
      mode: 'routed',
      routedVia: 'Interrupt Media',
      clientRateDisplay: '$125.00/h',
    },
    complianceDocs: [
      { kind: 'NDA', status: 'signed' },
      { kind: 'W-9', status: 'missing' },
    ],
  },
  {
    id: 'sydney-allen',
    name: 'Sydney Allen',
    role: 'Finance',
    entity: 'varia-global',
    rateHistory: [
      { id: 'rc-sydney-1', personId: 'sydney-allen', rateDisplay: '$60.00/h', effectiveFrom: 'Jan 2026' },
    ],
    routing: { personId: 'sydney-allen', mode: 'direct' },
    complianceDocs: [
      { kind: 'NDA', status: 'signed' },
      { kind: 'W-9', status: 'signed' },
    ],
  },
  {
    id: 'michael-hood',
    name: 'Michael Hood',
    role: 'Engineering',
    entity: 'the-matchbox',
    rateHistory: [
      { id: 'rc-michael-1', personId: 'michael-hood', rateDisplay: '$107.50/h', effectiveFrom: 'Mar 2026' },
    ],
    routing: { personId: 'michael-hood', mode: 'direct' },
    complianceDocs: [
      { kind: 'NDA', status: 'signed' },
      { kind: 'W-9', status: 'signed' },
    ],
  },
]
