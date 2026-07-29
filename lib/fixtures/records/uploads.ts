/**
 * Upload flow mock — the parsing is fixture-driven; the backend wires
 * real ingestion next. Two staged samples: a fresh Mercury CSV and a
 * duplicate (same sha-256 as a document already on record).
 */

export interface StagedCsvRow {
  date: string
  description: string
  amountDisplay: string
  suggestedCategory: string
  confidenceDisplay: string // "94%"
  confidence: number
}

export interface StagedFile {
  id: string
  name: string
  sizeDisplay: string // "18.4 KB"
  hash: string // sha-256, mono
  kind: 'csv' | 'pdf'
  duplicateOf?: string // document id already on record
  rows?: StagedCsvRow[]
}

export const sampleUpload: StagedFile = {
  id: 'staged-mercury-jul',
  name: 'mercury-statement-2026-07.csv',
  sizeDisplay: '18.4 KB',
  hash: 'sha256:7e2c9a4f6b1d8e3a0c5f9b2d7a4e1c8f5b0d3a6c9e2f7b4d1a8c5e0f3b6d9a2c',
  kind: 'csv',
  rows: [
    {
      date: 'Jul 27',
      description: 'HUBSPOT PAYOUT · GROSS $7,190.00 − FEES $214.75',
      amountDisplay: '$6,975.25',
      suggestedCategory: 'Client revenue · Ad Spend portal',
      confidenceDisplay: '94%',
      confidence: 94,
    },
    {
      date: 'Jul 26',
      description: 'ECOMMISSION INC · ACH DEPOSIT',
      amountDisplay: '$18,500.00',
      suggestedCategory: 'Invoice payment · ECMay3126',
      confidenceDisplay: '96%',
      confidence: 96,
    },
    {
      date: 'Jul 21',
      description: 'SYED ARSALAN RAZA · JUNE 1–15 PAYROLL',
      amountDisplay: '-$600.00',
      suggestedCategory: 'Contractor payroll',
      confidenceDisplay: '98%',
      confidence: 98,
    },
    {
      date: 'Jul 18',
      description: 'AWS · CLOUD SERVICES',
      amountDisplay: '-$342.17',
      suggestedCategory: 'Software & infrastructure',
      confidenceDisplay: '91%',
      confidence: 91,
    },
    {
      date: 'Jul 15',
      description: 'PAYROLL RUN · JUN 16–30 CYCLE',
      amountDisplay: '-$10,744.92',
      suggestedCategory: 'Contractor payroll · cycle 2026-06-H2',
      confidenceDisplay: '97%',
      confidence: 97,
    },
    {
      date: 'Jul 12',
      description: 'UNKNOWN COUNTERPARTY · WIRE',
      amountDisplay: '$1,250.00',
      suggestedCategory: 'Needs review',
      confidenceDisplay: '38%',
      confidence: 38,
    },
  ],
}

export const duplicateUpload: StagedFile = {
  id: 'staged-duplicate',
  name: 'mercury-statement-2026-06.pdf',
  sizeDisplay: '412 KB',
  hash: 'sha256:2b9e7d4f1a8c6e3b0d5f2a7c9e4b1d8f6a3c0e5b2d7f4a1c8e5b2d9f6a3c0e7b',
  kind: 'pdf',
  duplicateOf: 'doc-mercury-jun',
}
