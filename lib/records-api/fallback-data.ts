/**
 * Fallback data for the live Records API.
 *
 * These are NOT primary fixtures — they exist solely so that Banking and
 * Settings → Integrations keep rendering when the live endpoints
 * (/api/records/transactions, /api/records/sync-health) are unavailable.
 * Whenever a hub renders this data, it MUST show the "sample data" chip so it
 * is never mistaken for real records. The retired standalone banking-rows and
 * sync-card fixtures were consolidated here as the single labeled fallback.
 */

import type { BankTransaction } from '@/lib/types'
import type { SyncSourceView } from '@/lib/records-api/resources'

/**
 * The live /api/records/transactions endpoint returns a `category` used for
 * Banking chips (e.g. owner_draw, artist_royalty_payout). The base
 * BankTransaction type predates that field, so we widen it here for the
 * labeled fallback rows.
 */
type FallbackBankTransaction = BankTransaction & { category?: string }

function money(cents: number) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100).toLocaleString('en-US')
  const rem = String(abs % 100).padStart(2, '0')
  return { display: `${sign}$${dollars}.${rem}`, cents, currency: 'USD' as const }
}

/** Labeled fallback bank rows (mirror the real Mercury facts). */
export const fallbackBankTransactions: FallbackBankTransaction[] = [
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
    category: 'commission_payout',
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
    category: 'client_payment',
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
    category: 'payroll',
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
    category: 'payroll',
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
    category: 'client_payment',
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
    category: 'vendor_payment',
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
    category: 'artist_royalty_payout',
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
    category: 'client_payment',
  },
]

/** Labeled fallback sync sources for Settings → Integrations. */
export const fallbackSyncSources: SyncSourceView[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    scope: 'The Matchbox · Spyll World',
    health: 'healthy',
    healthNote: 'All accounts syncing',
    lastSync: 'Jul 27, 06:12',
    recordsIngested: 1284,
    webhookHeartbeat: '2 min ago',
    paused: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    scope: 'The Matchbox · The Ad Spend portals',
    health: 'degraded',
    healthNote: 'Ad Spend portal rate-limited since 04:30',
    lastSync: 'Jul 27, 04:28',
    recordsIngested: 356,
    webhookHeartbeat: '38 min ago',
    paused: false,
  },
  {
    id: 'asana',
    name: 'Asana',
    scope: 'Varia Global workspace',
    health: 'healthy',
    healthNote: 'Projects and time entries current',
    lastSync: 'Jul 27, 06:05',
    recordsIngested: 214,
    webhookHeartbeat: '5 min ago',
    paused: false,
  },
  {
    id: 'pandadoc',
    name: 'PandaDoc',
    scope: 'Contracts · all entities',
    health: 'healthy',
    healthNote: 'Idle — no new documents this week',
    lastSync: 'Jul 26, 22:00',
    recordsIngested: 48,
    webhookHeartbeat: '—',
    paused: true,
  },
]
