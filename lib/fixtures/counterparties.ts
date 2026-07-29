import type { Counterparty } from '@/lib/types'

/**
 * Counterparties — anyone money moves to or from. "Client" is a role,
 * not a type: one row can carry several roles (HubSpot is a vendor AND
 * a commission source), and one counterparty can hold relationships
 * with several of our entities (SoundExchange pays both Spyll World
 * and Spyll Publishing).
 */
export const counterparties: Counterparty[] = [
  {
    id: 'ecommission',
    name: 'eCommission',
    roles: ['client'],
    relationships: [
      {
        id: 'rel-ecom-matchbox',
        role: 'client',
        entity: 'the-matchbox',
        streamType: 'retainer + fixed-fee projects',
        status: 'active',
        effectiveFrom: 'Jan 2026',
      },
    ],
    contracts: [
      {
        id: 'ct-ecom-retainer',
        counterpartyId: 'ecommission',
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
        counterpartyId: 'ecommission',
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
    roles: ['client'],
    relationships: [
      {
        id: 'rel-celigo-matchbox',
        role: 'client',
        entity: 'the-matchbox',
        streamType: 'monthly retainer',
        status: 'active',
        effectiveFrom: 'Mar 2026',
      },
    ],
    contracts: [
      {
        id: 'ct-celigo-retainer',
        counterpartyId: 'celigo',
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
    roles: ['client'],
    relationships: [
      {
        id: 'rel-maxwell-matchbox',
        role: 'client',
        entity: 'the-matchbox',
        streamType: 'hourly engagement',
        status: 'active',
        effectiveFrom: 'Apr 2026',
      },
    ],
    contracts: [
      {
        id: 'ct-maxwell-hourly',
        counterpartyId: 'maxwell-social',
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
    roles: ['client'],
    relationships: [
      {
        id: 'rel-pineapple-matchbox',
        role: 'client',
        entity: 'the-matchbox',
        streamType: 'project work — terms unresolved',
        status: 'active',
        effectiveFrom: 'Jun 2026',
      },
    ],
    contracts: [
      {
        id: 'ct-pineapple-missing',
        counterpartyId: 'pineapple-family',
        name: 'No contract on file',
        kind: 'retainer',
        status: 'missing_terms',
        terms: [],
        rules: [],
      },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    roles: ['vendor', 'commission source'],
    relationships: [
      {
        id: 'rel-hubspot-vendor',
        role: 'vendor',
        entity: 'the-matchbox',
        streamType: 'SaaS subscription — seats + portals',
        status: 'active',
        effectiveFrom: 'Feb 2026',
      },
      {
        id: 'rel-hubspot-commission',
        role: 'commission source',
        entity: 'the-matchbox',
        streamType: 'solutions-partner commission payouts',
        status: 'active',
        effectiveFrom: 'May 2026',
      },
    ],
    contracts: [],
  },
  {
    id: 'interrupt-media',
    name: 'Interrupt Media',
    roles: ['vendor', 'partner'],
    relationships: [
      {
        id: 'rel-im-vendor',
        role: 'vendor',
        entity: 'the-matchbox',
        streamType: 'subcontracted labor — invoices monthly',
        status: 'active',
        effectiveFrom: 'Apr 2026',
      },
      {
        id: 'rel-im-partner',
        role: 'partner',
        entity: 'the-matchbox',
        streamType: 'shared-staffing arrangement (Tess, Arsalan)',
        status: 'active',
        effectiveFrom: 'Apr 2026',
      },
    ],
    contracts: [],
  },
  {
    id: 'rebld-ai',
    name: 'Rebld.ai',
    aliases: ['HiJenny'],
    roles: ['customer'],
    relationships: [
      {
        id: 'rel-rebld-adspend',
        role: 'customer',
        entity: 'the-ad-spend',
        streamType: 'self-serve subscription',
        status: 'active',
        effectiveFrom: 'May 2026',
      },
    ],
    contracts: [],
  },
  {
    id: 'soundexchange',
    name: 'SoundExchange',
    roles: ['royalty source'],
    relationships: [
      {
        id: 'rel-sx-spyll-world',
        role: 'royalty source',
        entity: 'spyll-world',
        streamType: 'digital-performance royalties — sound recordings',
        status: 'active',
        effectiveFrom: 'Jan 2026',
      },
      {
        id: 'rel-sx-spyll-publishing',
        role: 'royalty source',
        entity: 'spyll-publishing',
        streamType: 'digital-performance royalties — publishing share',
        status: 'active',
        effectiveFrom: 'Jan 2026',
      },
    ],
    contracts: [],
  },
]
