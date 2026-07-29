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
