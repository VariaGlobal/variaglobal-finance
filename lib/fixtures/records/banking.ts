/**
 * Records → Banking. Conforms to lib/types.ts BankTransaction.
 * Includes the real Mercury facts referenced by rulings: the $600
 * Arsalan catch-up (txn 9f1d882e…) and the $18,500 eCommission
 * deposit matched to ECMay3126.
 */

import type { BankTransaction } from '@/lib/types'

function money(cents: number) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  const rem = String(abs % 100).padStart(2, '0')
  return { display: `${sign}$${dollars}.${rem}`, cents, currency: 'USD' as const }
}

export const bankTransactions: BankTransaction[] = [
  {
    id: 'bt-jul27-hubspot',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'credit',
    amount: money(697525),
    description: 'HUBSPOT PAYOUT · JUL 24 GROSS $7,190.00 − FEES $214.75',
    createdAt: 'Jul 24',
    postedAt: 'Jul 27',
    matched: false,
  },
  {
    id: 'bt-jul26-ecom',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'credit',
    amount: money(1850000),
    description: 'ECOMMISSION INC · ACH DEPOSIT',
    createdAt: 'Jul 25',
    postedAt: 'Jul 26',
    matched: true,
  },
  {
    id: 'bt-jul21-arsalan',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'debit',
    amount: money(-60000),
    description:
      'SYED ARSALAN RAZA · June 1 through 15 2026 payroll 6 hours at 100USD per hour · 9f1d882e-8217-11f1-a4d1-a34b61ec221a',
    createdAt: 'Jul 21',
    postedAt: 'Jul 21',
    matched: true,
  },
  {
    id: 'bt-jul15-payroll',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'debit',
    amount: money(-1074492),
    description: 'PAYROLL RUN · JUN 16–30 CYCLE · 12 CONTRACTORS',
    createdAt: 'Jul 15',
    postedAt: 'Jul 15',
    matched: true,
  },
  {
    id: 'bt-jul14-celigo',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'credit',
    amount: money(750000),
    description: 'CELIGO INC · MONTHLY RETAINER JUL',
    createdAt: 'Jul 13',
    postedAt: 'Jul 14',
    matched: true,
  },
  {
    id: 'bt-jul10-im',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'debit',
    amount: money(-137500),
    description: 'INTERRUPT MEDIA LLC · VENDOR SETTLEMENT JUN (TESS FAZIO 11H)',
    createdAt: 'Jul 9',
    postedAt: 'Jul 10',
    matched: true,
  },
  {
    id: 'bt-jul08-spyll',
    account: 'Spyll World checking',
    entity: 'spyll-world',
    direction: 'credit',
    amount: money(325000),
    description: 'SHOPIFY PAYOUT · SPYLL WORLD STORE',
    createdAt: 'Jul 7',
    postedAt: 'Jul 8',
    matched: false,
  },
  {
    id: 'bt-jul05-maxwell',
    account: 'The Matchbox checking',
    entity: 'the-matchbox',
    direction: 'credit',
    amount: money(462000),
    description: 'MAXWELL SOCIAL · INV MXJUN2026 PARTIAL',
    createdAt: 'Jul 3',
    postedAt: 'Jul 5',
    matched: true,
  },
]
