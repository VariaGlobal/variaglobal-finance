/**
 * Records → Documents. Conforms to lib/types.ts DocumentRef.
 * Hashes are content sha-256 (mock) — the duplicate-rejection key.
 */

import type { DocumentRef } from '@/lib/types'

export const documents: DocumentRef[] = [
  {
    id: 'doc-payout-tracker',
    name: 'CONTRACTOR PAYOUT TRACKER.xlsx',
    kind: 'statement',
    hash: 'sha256:8f3a1c2e94b7d6a05e1f8c3b2a9d7e6f4c1b0a9887e6d5c4b3a2918070f6e5d4',
    uploadedAt: 'Jul 27',
    evidences: ['2026-06-H2', '2026-07-H1'],
  },
  {
    id: 'doc-mercury-jun',
    name: 'mercury-statement-2026-06.pdf',
    kind: 'statement',
    hash: 'sha256:2b9e7d4f1a8c6e3b0d5f2a7c9e4b1d8f6a3c0e5b2d7f4a1c8e5b2d9f6a3c0e7b',
    uploadedAt: 'Jul 2',
    evidences: ['bt-jul15-payroll', 'bt-jul21-arsalan'],
  },
  {
    id: 'doc-ecom-msa',
    name: 'eCommission-MSA-2026.pdf',
    kind: 'contract',
    hash: 'sha256:6c1f9a4e2d7b5c8a3f0e6d1b9c4a7e2f5d8b3a0c6e9f4d1a7b2c5e8f3a6d0b9c',
    uploadedAt: 'Jan 12',
    evidences: ['ct-ecom-retainer', 'ct-ecom-hubspot'],
  },
  {
    id: 'doc-im-invoice-jun',
    name: 'InterruptMedia-TMB-June.pdf',
    kind: 'invoice',
    hash: 'sha256:4d8a2f6c0e9b3d7a1c5f8e2b6d0a4c9e3f7b1d5a8c2e6f0b4d9a3c7e1f5b8d2a',
    uploadedAt: 'Jul 8',
    evidences: ['bt-jul10-im', '2026-06-H2'],
  },
  {
    id: 'doc-tess-nda',
    name: 'Tess-Fazio-NDA-signed.pdf',
    kind: 'compliance',
    hash: 'sha256:9e5b1d7a3f0c8e4b2d6a9f3c7e1b5d8a0c4f9e2b6d3a7c0e5f8b1d4a9c2e6f3b',
    uploadedAt: 'Feb 3',
    evidences: ['tess-fazio'],
  },
  {
    id: 'doc-finance-raw',
    name: 'Varia_Finance Dashboard Data_RAW.xlsx',
    kind: 'other',
    hash: 'sha256:1a7c3e9f5b2d8a4c0e6f2b9d5a1c7e3f8b4d0a6c2e9f5b1d7a3c8e4f0b6d2a9c',
    uploadedAt: 'Jul 27',
    evidences: ['2026-06-H2', '2026-07-H1'],
  },
]

/* ── Preview drawer details ─────────────────────────────────────────── */

export interface StoredAnalysis {
  model: string
  date: string
  /** Exactly 4 summary lines — stored, never auto-run. */
  lines: [string, string, string, string]
}

export interface DocumentDetails {
  uploadedBy: string
  previewKind: 'pdf' | 'csv'
  analysis?: StoredAnalysis
}

export const documentDetails: Record<string, DocumentDetails> = {
  'doc-payout-tracker': {
    uploadedBy: 'Sydney Allen',
    previewKind: 'csv',
    analysis: {
      model: 'claude-sonnet-4-5',
      date: 'Jul 27, 14:32',
      lines: [
        'Two pay cycles extracted cell-by-cell: Jun 16–30 and Jul 1–15.',
        'Jun 16–30 totals $11,344.92 across 12 people; Tess Fazio routed via IM.',
        'Jul 1–15 totals $14,953.08 pending RUL-002 on Arsalan (3h IM overlap).',
        'Hours reconcile to the minute against Asana exports — no variances.',
      ],
    },
  },
  'doc-mercury-jun': {
    uploadedBy: 'Sydney Allen',
    previewKind: 'pdf',
    analysis: {
      model: 'claude-sonnet-4-5',
      date: 'Jul 2, 09:18',
      lines: [
        'Mercury June statement for The Matchbox checking, 38 transactions.',
        'Payroll run Jun 16–30 debit of $10,744.92 matched to cycle records.',
        'Arsalan $600.00 catch-up (Jun 1–15, 6h) identified by reference id.',
        'All credits matched to invoices except HubSpot payout (fees pending).',
      ],
    },
  },
  'doc-ecom-msa': {
    uploadedBy: 'Ani Bisaria',
    previewKind: 'pdf',
  },
  'doc-im-invoice-jun': {
    uploadedBy: 'Sydney Allen',
    previewKind: 'pdf',
    analysis: {
      model: 'claude-sonnet-4-5',
      date: 'Jul 8, 11:05',
      lines: [
        'Interrupt Media vendor invoice for June: Tess Fazio, 11h at $125.00/h.',
        'Total $1,375.00 matches the Jun 16–30 cycle vendor accrual exactly.',
        'Settled via Mercury debit posted Jul 10 — chain fully linked.',
        'No Arsalan hours on this invoice; RUL-002 overlap remains open.',
      ],
    },
  },
  'doc-tess-nda': {
    uploadedBy: 'Ani Bisaria',
    previewKind: 'pdf',
  },
  'doc-finance-raw': {
    uploadedBy: 'Sydney Allen',
    previewKind: 'csv',
  },
}

/** Human labels for record ids a document evidences — backlink targets. */
export const evidenceLabels: Record<string, { label: string; tab: string; openId?: string }> = {
  '2026-06-H2': { label: 'Pay cycle Jun 16–30', tab: 'cycles', openId: '2026-06-H2' },
  '2026-07-H1': { label: 'Pay cycle Jul 1–15', tab: 'cycles', openId: '2026-07-H1' },
  'bt-jul15-payroll': { label: 'Bank row · payroll Jun 16–30', tab: 'banking' },
  'bt-jul21-arsalan': { label: 'Bank row · Arsalan $600.00', tab: 'banking' },
  'bt-jul10-im': { label: 'Bank row · IM settlement', tab: 'banking' },
  'ct-ecom-retainer': { label: 'eCommission · retainer', tab: 'counterparties', openId: 'ecommission' },
  'ct-ecom-hubspot': { label: 'eCommission · HubSpot migration', tab: 'counterparties', openId: 'ecommission' },
  'tess-fazio': { label: 'Tess Fazio', tab: 'people', openId: 'tess-fazio' },
}
