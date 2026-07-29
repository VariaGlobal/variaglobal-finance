/**
 * Records → Billing. Invoices across the full lifecycle plus payments
 * received, linked to invoices and bank rows. Conforms to lib/types.ts.
 */

import type { Invoice, Payment } from '@/lib/types'

function money(cents: number) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  const rem = String(abs % 100).padStart(2, '0')
  return { display: `${sign}$${dollars}.${rem}`, cents, currency: 'USD' as const }
}

export const invoices: Invoice[] = [
  {
    id: 'inv-ecmay3126',
    clientId: 'ecommission',
    number: 'ECMay3126',
    status: 'paid',
    lines: [
      { id: 'inv-ecmay3126-1', description: 'Monthly retainer · May', amount: money(450000) },
      { id: 'inv-ecmay3126-2', description: 'HubSpot migration · phase 1 milestone', amount: money(1400000) },
    ],
    total: money(1850000),
    issuedAt: 'May 31',
    dueAt: 'Jun 30',
  },
  {
    id: 'inv-ecjun3026',
    clientId: 'ecommission',
    number: 'ECJun3026',
    status: 'sent',
    lines: [
      { id: 'inv-ecjun3026-1', description: 'Monthly retainer · Jun', amount: money(450000) },
      { id: 'inv-ecjun3026-2', description: 'Overage · 4.5h @ $200.00/h', amount: money(90000) },
    ],
    total: money(540000),
    issuedAt: 'Jun 30',
    dueAt: 'Jul 30',
  },
  {
    id: 'inv-mxjun2026',
    clientId: 'maxwell-social',
    number: 'MXJun2026',
    status: 'partially_paid',
    lines: [
      { id: 'inv-mxjun2026-1', description: 'Hourly engagement · Jun · 50.0h', amount: money(700000) },
    ],
    total: money(700000),
    issuedAt: 'Jun 30',
    dueAt: 'Jul 30',
  },
  {
    id: 'inv-celjul2026',
    clientId: 'celigo',
    number: 'CELJul2026',
    status: 'paid',
    lines: [
      { id: 'inv-celjul2026-1', description: 'Monthly retainer · Jul', amount: money(750000) },
    ],
    total: money(750000),
    issuedAt: 'Jul 1',
    dueAt: 'Jul 15',
  },
  {
    id: 'inv-pfjul2026',
    clientId: 'pineapple-family',
    number: 'PFJul2026',
    status: 'disputed',
    lines: [
      { id: 'inv-pfjul2026-1', description: 'Hourly · Jul · 12.0h', amount: money(240000) },
      { id: 'inv-pfjul2026-2', description: 'Overage · 1.5h @ $200.00/h', amount: money(30000) },
    ],
    total: money(270000),
    issuedAt: 'Jul 20',
    dueAt: 'Aug 19',
  },
  {
    id: 'inv-ecjul3126',
    clientId: 'ecommission',
    number: 'ECJul3126',
    status: 'draft',
    lines: [
      { id: 'inv-ecjul3126-1', description: 'Monthly retainer · Jul', amount: money(450000) },
    ],
    total: money(450000),
    issuedAt: '—',
  },
  {
    id: 'inv-mxapr2026',
    clientId: 'maxwell-social',
    number: 'MXApr2026',
    status: 'void',
    lines: [
      { id: 'inv-mxapr2026-1', description: 'Hourly engagement · Apr (superseded — wrong rate)', amount: money(517500) },
    ],
    total: money(517500),
    issuedAt: 'Apr 30',
  },
]

export interface PaymentDisplay extends Payment {
  invoiceNumber?: string
  bankTransactionId?: string
  bankRowLabel?: string
}

export const payments: PaymentDisplay[] = [
  {
    id: 'pay-ecmay3126',
    invoiceId: 'inv-ecmay3126',
    invoiceNumber: 'ECMay3126',
    amount: money(1850000),
    receivedAt: 'Jul 26',
    method: 'Mercury ACH',
    bankTransactionId: 'bt-jul26-ecom',
    bankRowLabel: 'ECOMMISSION INC · posted Jul 26',
  },
  {
    id: 'pay-celjul2026',
    invoiceId: 'inv-celjul2026',
    invoiceNumber: 'CELJul2026',
    amount: money(750000),
    receivedAt: 'Jul 14',
    method: 'Mercury ACH',
    bankTransactionId: 'bt-jul14-celigo',
    bankRowLabel: 'CELIGO INC · posted Jul 14',
  },
  {
    id: 'pay-mxjun2026',
    invoiceId: 'inv-mxjun2026',
    invoiceNumber: 'MXJun2026',
    amount: money(462000),
    receivedAt: 'Jul 5',
    method: 'Mercury ACH',
    bankTransactionId: 'bt-jul05-maxwell',
    bankRowLabel: 'MAXWELL SOCIAL · posted Jul 5',
  },
]
