/**
 * Records → Billing. Invoices across the full lifecycle plus payments,
 * split by direction: receivable (owed to us) and payable (we owe vendors).
 * Conforms to lib/types.ts; `direction` is an additive field carried on a
 * thin extension so AR and AP never share a table.
 *
 * SAMPLE DATA — Billing renders these bundled fixtures (and shows the
 * "sample data" chip) until real invoices land in the database. Due dates are
 * deliberately spread across aging buckets relative to the app date so the
 * redesign exercises every state; every counterparty id is real.
 */

import type { Invoice, Payment } from '@/lib/types'

export type BillingDirection = 'receivable' | 'payable'

/** Invoice plus which way the money flows. */
export interface BillingInvoice extends Invoice {
  direction: BillingDirection
}

function money(cents: number) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  const rem = String(abs % 100).padStart(2, '0')
  return { display: `${sign}$${dollars}.${rem}`, cents, currency: 'USD' as const }
}

/* ── Receivable — invoices clients owe us ─────────────────────────────── */

const receivable: BillingInvoice[] = [
  {
    id: 'inv-ecmay3126',
    direction: 'receivable',
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
    direction: 'receivable',
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
    direction: 'receivable',
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
    direction: 'receivable',
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
    id: 'inv-celmay2026',
    direction: 'receivable',
    clientId: 'celigo',
    number: 'CELMay2026',
    status: 'sent',
    lines: [
      { id: 'inv-celmay2026-1', description: 'Monthly retainer · May', amount: money(750000) },
    ],
    total: money(750000),
    issuedAt: 'May 20',
    dueAt: 'Jun 20',
  },
  {
    id: 'inv-rbjul2026',
    direction: 'receivable',
    clientId: 'rebld-ai',
    number: 'RBJul2026',
    status: 'sent',
    lines: [
      { id: 'inv-rbjul2026-1', description: 'Ad Spend management · Jul', amount: money(280000) },
      { id: 'inv-rbjul2026-2', description: 'Creative testing add-on', amount: money(40000) },
    ],
    total: money(320000),
    issuedAt: 'Jul 24',
    dueAt: 'Aug 22',
  },
  {
    id: 'inv-pfmar2026',
    direction: 'receivable',
    clientId: 'pineapple-family',
    number: 'PFMar2026',
    status: 'sent',
    lines: [
      { id: 'inv-pfmar2026-1', description: 'Hourly · Mar · 9.0h', amount: money(180000) },
    ],
    total: money(180000),
    issuedAt: 'Mar 31',
    dueAt: 'May 25',
  },
  {
    id: 'inv-pfjul2026',
    direction: 'receivable',
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
    direction: 'receivable',
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
    direction: 'receivable',
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

/* ── Payable — vendor bills we owe ────────────────────────────────────── */

const payable: BillingInvoice[] = [
  {
    id: 'inv-im-jun2026',
    direction: 'payable',
    clientId: 'interrupt-media',
    number: 'IM-2026-06',
    status: 'paid',
    lines: [
      { id: 'inv-im-jun2026-1', description: 'Vendor settlement · Jun · Tess Fazio 11.0h', amount: money(137500) },
    ],
    total: money(137500),
    issuedAt: 'Jul 1',
    dueAt: 'Jul 15',
  },
  {
    id: 'inv-im-jul2026',
    direction: 'payable',
    clientId: 'interrupt-media',
    number: 'IM-2026-07',
    status: 'sent',
    lines: [
      { id: 'inv-im-jul2026-1', description: 'Vendor settlement · Jul · Tess Fazio 16.5h', amount: money(206250) },
    ],
    total: money(206250),
    issuedAt: 'Aug 1',
    dueAt: 'Aug 15',
  },
  {
    id: 'inv-hs-jul2026',
    direction: 'payable',
    clientId: 'hubspot',
    number: 'HS-INV-4471',
    status: 'sent',
    lines: [
      { id: 'inv-hs-jul2026-1', description: 'Marketing Hub Pro · Jul seats', amount: money(89000) },
    ],
    total: money(89000),
    issuedAt: 'Jul 14',
    dueAt: 'Jul 28',
  },
]

export const invoices: BillingInvoice[] = [...receivable, ...payable]

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
  {
    id: 'pay-im-jun2026',
    invoiceId: 'inv-im-jun2026',
    invoiceNumber: 'IM-2026-06',
    amount: money(137500),
    receivedAt: 'Jul 10',
    method: 'Mercury ACH',
    bankTransactionId: 'bt-jul10-im',
    bankRowLabel: 'INTERRUPT MEDIA LLC · posted Jul 10',
  },
]
