import type { Client } from '@/lib/types'

export const clients: Client[] = [
  {
    id: 'ecommission',
    name: 'eCommission',
    entity: 'the-matchbox',
    contracts: [
      {
        id: 'ct-ecom-retainer',
        clientId: 'ecommission',
        name: 'Monthly retainer',
        kind: 'retainer',
        status: 'active',
        terms: [
          {
            id: 'tt-ecom-1',
            summary: '$4,500/mo retainer · 22.5h included · $200/h overage',
            retainerDisplay: '$4,500.00/mo',
            includedHoursDisplay: '22.5h',
            overageRateDisplay: '$200.00/h',
            effectiveFrom: 'Jan 2026',
          },
        ],
        rules: [
          {
            id: 'rule-ecom-arsalan',
            label: 'excludes Arsalan — billed via IM',
            kind: 'exclusion',
          },
        ],
      },
      {
        id: 'ct-ecom-hubspot',
        clientId: 'ecommission',
        name: 'HubSpot migration',
        kind: 'fixed',
        status: 'active',
        terms: [
          {
            id: 'tt-ecom-hs-1',
            summary: '$60,000 fixed · phase 1 overage-exempt until Aug',
            fixedFeeDisplay: '$60,000.00',
            effectiveFrom: 'May 2026',
          },
        ],
        rules: [
          {
            id: 'rule-ecom-hs-phase1',
            label: 'phase 1 overage-exempt until Aug',
            kind: 'exemption',
            activeUntil: 'Aug 2026',
          },
        ],
      },
    ],
  },
  {
    id: 'celigo',
    name: 'Celigo',
    entity: 'the-matchbox',
    contracts: [
      {
        id: 'ct-celigo-retainer',
        clientId: 'celigo',
        name: 'Monthly retainer',
        kind: 'retainer',
        status: 'active',
        terms: [
          {
            id: 'tt-celigo-1',
            summary: '$7,500/mo retainer · 33h included · $225/h overage',
            retainerDisplay: '$7,500.00/mo',
            includedHoursDisplay: '33h',
            overageRateDisplay: '$225.00/h',
            effectiveFrom: 'Mar 2026',
          },
        ],
        rules: [],
      },
    ],
  },
  {
    id: 'maxwell-social',
    name: 'Maxwell Social',
    entity: 'the-matchbox',
    contracts: [
      {
        id: 'ct-maxwell-hourly',
        clientId: 'maxwell-social',
        name: 'Hourly engagement',
        kind: 'retainer',
        status: 'active',
        terms: [
          {
            id: 'tt-maxwell-1',
            summary: 'Hourly · volume varies by month',
            effectiveFrom: 'Apr 2026',
          },
        ],
        rules: [],
      },
    ],
    hoursByMonth: { Apr: '45.0h', May: '60.0h', Jun: '50.0h', Jul: '40.0h' },
  },
  {
    id: 'pineapple-family',
    name: 'Pineapple Family',
    entity: 'the-matchbox',
    contracts: [
      {
        id: 'ct-pineapple-missing',
        clientId: 'pineapple-family',
        name: 'No contract on file',
        kind: 'retainer',
        status: 'missing_terms',
        terms: [],
        rules: [],
      },
    ],
  },
]
