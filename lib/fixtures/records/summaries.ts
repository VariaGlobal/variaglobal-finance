/**
 * Hover summaries — 3–4 instant facts for every person, client, cycle,
 * invoice, and document reference, keyed by record id. No loading state:
 * these render synchronously from memory.
 */

export interface SummaryFact {
  label: string
  value: string
  mono?: boolean
}

export interface RecordSummary {
  title: string
  meta: string // middle-dot metadata line
  facts: SummaryFact[]
}

export const summaries: Record<string, RecordSummary> = {
  /* ── People ─────────────────────────────────────────────── */
  'abdullah-siddiqui': {
    title: 'Abdullah Siddiqui',
    meta: 'Engineering · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$70.00/h', mono: true },
      { label: 'Jul 1–15', value: '48.75h · $3,412.50', mono: true },
      { label: 'Jun 16–30', value: '53h · $3,710.00', mono: true },
      { label: 'Compliance', value: 'NDA signed · W-9 signed' },
    ],
  },
  'aditya-vyavahare': {
    title: 'Aditya Vyavahare',
    meta: 'Design · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$30.00/h', mono: true },
      { label: 'Jul 1–15', value: '16.47h · $494.00', mono: true },
      { label: 'Compliance', value: 'NDA signed · W-9 signed' },
    ],
  },
  arsalan: {
    title: 'Arsalan',
    meta: 'HubSpot ops · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$100.00/h', mono: true },
      { label: 'Open ruling', value: 'RUL-002 — subtract 3h paid via IM?' },
      { label: 'Deferred in', value: 'Jun 16–30 · 51.5h · RUL-001', mono: true },
      { label: 'Last paid', value: '$600.00 · Jul 21 · Mercury', mono: true },
    ],
  },
  'desiree-clark': {
    title: 'Desirée Clark',
    meta: 'Content · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$20.00/h', mono: true },
      { label: 'Jun 16–30', value: '11.2h · $224.00', mono: true },
      { label: 'Compliance', value: 'NDA signed · W-9 signed' },
    ],
  },
  'emily-hill': {
    title: 'Emily Hill',
    meta: 'Account management · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$75.00/h', mono: true },
      { label: 'Jul 1–15', value: '23.17h · $1,737.50', mono: true },
      { label: 'Jun 16–30', value: '21.5h · $1,612.50', mono: true },
    ],
  },
  'harriett-wells': {
    title: 'Harriett Wells',
    meta: 'Marketing ops · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$30.00/h', mono: true },
      { label: 'Jul 1–15', value: '34.13h · $1,024.00', mono: true },
      { label: 'Jun 16–30', value: '35.83h · $1,075.00', mono: true },
    ],
  },
  'kayla-krasnow': {
    title: 'Kayla Krasnow',
    meta: 'Strategy · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$75.00/h', mono: true },
      { label: 'Jul 1–15', value: '19.42h · $1,456.25', mono: true },
      { label: 'Rate card', value: 'Jun entry backfilled · RUL-004' },
    ],
  },
  'kirsten-conaster': {
    title: 'Kirsten Conaster',
    meta: 'Content · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$40.00/h', mono: true },
      { label: 'Jun 16–30', value: '1h · $40.00', mono: true },
      { label: 'Compliance', value: 'NDA signed · W-9 signed' },
    ],
  },
  'megan-breyer': {
    title: 'Megan Breyer',
    meta: 'Account management · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$75.00/h · third raise this year', mono: true },
      { label: 'Jul 1–15', value: '27.5h · $2,062.50', mono: true },
      { label: 'Jun 16–30', value: '25.98h · $1,948.75', mono: true },
    ],
  },
  'miles-lorentzen': {
    title: 'Miles Lorentzen',
    meta: 'Production · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$20.00/h', mono: true },
      { label: 'Jul 1–15', value: '25.07h · $501.33', mono: true },
      { label: 'Rate card', value: 'Jun entry backfilled · RUL-004' },
    ],
  },
  'sydney-allen': {
    title: 'Sydney Allen',
    meta: 'Finance · Varia Global · direct',
    facts: [
      { label: 'Rate', value: '$60.00/h', mono: true },
      { label: 'Jul 1–15', value: '10.25h · $615.00', mono: true },
      { label: 'Role', value: 'Prepares cycles · proposes rules' },
    ],
  },
  'tess-fazio': {
    title: 'Tess Fazio',
    meta: 'Marketing ops · routed via Interrupt Media',
    facts: [
      { label: 'Bill rate', value: '$125.00/h (IM-side)', mono: true },
      { label: 'Jul accrual', value: '11.75h · $1,468.75 → IM', mono: true },
      { label: 'Jun accrual', value: '11h · $1,375.00 → settled Jul 10', mono: true },
      { label: 'Compliance', value: 'NDA signed · W-9 missing' },
    ],
  },
  'zach-crew': {
    title: 'Zach Crew',
    meta: 'Production support · The Matchbox · direct',
    facts: [
      { label: 'Rate', value: '$15.00/h · tab only · RUL-003', mono: true },
      { label: 'Jun 16–30', value: '20h · $300.00', mono: true },
      { label: 'Rate card', value: 'Absent both months — backfilled' },
    ],
  },

  /* ── Clients ────────────────────────────────────────────── */
  ecommission: {
    title: 'eCommission',
    meta: 'The Matchbox · 2 active contracts',
    facts: [
      { label: 'Retainer', value: '$4,500.00/mo · 22.5h included', mono: true },
      { label: 'Project', value: 'HubSpot migration · $60,000.00 fixed', mono: true },
      { label: 'Open invoice', value: 'ECJun3026 · $5,400.00 · sent', mono: true },
      { label: 'Rule', value: 'excludes Arsalan — billed via IM' },
    ],
  },
  celigo: {
    title: 'Celigo',
    meta: 'The Matchbox · retainer client',
    facts: [
      { label: 'Retainer', value: '$7,500.00/mo · 33h included', mono: true },
      { label: 'Overage', value: '$225.00/h', mono: true },
      { label: 'Last paid', value: 'CELJul2026 · Jul 14 · Mercury ACH', mono: true },
    ],
  },
  'maxwell-social': {
    title: 'Maxwell Social',
    meta: 'The Matchbox · hourly engagement',
    facts: [
      { label: 'Jun billed', value: '50.0h · $7,000.00', mono: true },
      { label: 'Received', value: '$4,620.00 partial · Jul 5', mono: true },
      { label: 'Balance', value: '$2,380.00 open', mono: true },
    ],
  },
  'pineapple-family': {
    title: 'Pineapple Family',
    meta: 'The Matchbox · no contract on file',
    facts: [
      { label: 'Status', value: 'missing terms — flagged in queue' },
      { label: 'Open invoice', value: 'PFJul2026 · $2,700.00 · disputed', mono: true },
      { label: 'Last ruling', value: '1.5h overage waived · Jul 24' },
    ],
  },

  /* ── Pay cycles ─────────────────────────────────────────── */
  '2026-06-H2': {
    title: 'Pay cycle Jun 16–30',
    meta: 'The Matchbox · paid Jul 15',
    facts: [
      { label: 'Payable', value: '$11,344.92 · 12 people', mono: true },
      { label: 'Vendor accrual', value: '$1,375.00 → Interrupt Media', mono: true },
      { label: 'Deferred out', value: 'Arsalan 51.5h · $5,150.00 · RUL-001', mono: true },
    ],
  },
  '2026-07-H1': {
    title: 'Pay cycle Jul 1–15',
    meta: 'The Matchbox · to be paid Jul 31',
    facts: [
      { label: 'Payable', value: '$14,953.08 · 9 people', mono: true },
      { label: 'Vendor accrual', value: '$1,468.75 → Interrupt Media', mono: true },
      { label: 'Pending', value: 'RUL-002 — $5,150.00 or $4,850.00', mono: true },
    ],
  },

  /* ── Invoices ───────────────────────────────────────────── */
  'inv-ecmay3126': {
    title: 'ECMay3126',
    meta: 'eCommission · paid',
    facts: [
      { label: 'Total', value: '$18,500.00', mono: true },
      { label: 'Received', value: 'Jul 26 · Mercury ACH', mono: true },
      { label: 'Bank row', value: 'ECOMMISSION INC · posted Jul 26' },
    ],
  },
  'inv-ecjun3026': {
    title: 'ECJun3026',
    meta: 'eCommission · sent',
    facts: [
      { label: 'Total', value: '$5,400.00', mono: true },
      { label: 'Due', value: 'Jul 30' },
      { label: 'Includes', value: 'Overage 4.5h @ $200.00/h', mono: true },
    ],
  },
  'inv-mxjun2026': {
    title: 'MXJun2026',
    meta: 'Maxwell Social · partially paid',
    facts: [
      { label: 'Total', value: '$7,000.00', mono: true },
      { label: 'Received', value: '$4,620.00 · Jul 5', mono: true },
      { label: 'Balance', value: '$2,380.00 open', mono: true },
    ],
  },
  'inv-celjul2026': {
    title: 'CELJul2026',
    meta: 'Celigo · paid',
    facts: [
      { label: 'Total', value: '$7,500.00', mono: true },
      { label: 'Received', value: 'Jul 14 · Mercury ACH' },
      { label: 'Terms', value: 'Net 15 · retainer' },
    ],
  },
  'inv-pfjul2026': {
    title: 'PFJul2026',
    meta: 'Pineapple Family · disputed',
    facts: [
      { label: 'Total', value: '$2,700.00', mono: true },
      { label: 'Dispute', value: 'Client contests 1.5h overage' },
      { label: 'Related', value: 'Overage waived in queue · Jul 24' },
    ],
  },
  'inv-ecjul3126': {
    title: 'ECJul3126',
    meta: 'eCommission · draft',
    facts: [
      { label: 'Total', value: '$4,500.00', mono: true },
      { label: 'State', value: 'Not yet issued' },
      { label: 'Covers', value: 'Monthly retainer · Jul' },
    ],
  },
  'inv-mxapr2026': {
    title: 'MXApr2026',
    meta: 'Maxwell Social · void',
    facts: [
      { label: 'Total', value: '$5,175.00', mono: true },
      { label: 'Voided', value: 'Superseded — wrong rate applied' },
      { label: 'Replaced by', value: 'Corrected April invoice' },
    ],
  },

  /* ── Documents ──────────────────────────────────────────── */
  'doc-payout-tracker': {
    title: 'CONTRACTOR PAYOUT TRACKER.xlsx',
    meta: 'Statement · uploaded Jul 27',
    facts: [
      { label: 'Evidences', value: 'Jun 16–30 and Jul 1–15 cycles' },
      { label: 'Extraction', value: 'Cell-by-cell · verified to the minute' },
      { label: 'Hash', value: 'sha256:8f3a1c2e…f6e5d4', mono: true },
    ],
  },
  'doc-mercury-jun': {
    title: 'mercury-statement-2026-06.pdf',
    meta: 'Statement · uploaded Jul 2',
    facts: [
      { label: 'Evidences', value: 'Jun payroll run · Arsalan $600 catch-up' },
      { label: 'Account', value: 'The Matchbox checking' },
      { label: 'Hash', value: 'sha256:2b9e7d4f…a3c0e7b', mono: true },
    ],
  },
  'doc-ecom-msa': {
    title: 'eCommission-MSA-2026.pdf',
    meta: 'Contract · uploaded Jan 12',
    facts: [
      { label: 'Evidences', value: 'Retainer + HubSpot migration terms' },
      { label: 'Effective', value: 'Jan 2026' },
      { label: 'Hash', value: 'sha256:6c1f9a4e…3a6d0b9c', mono: true },
    ],
  },
  'doc-im-invoice-jun': {
    title: 'InterruptMedia-TMB-June.pdf',
    meta: 'Invoice · uploaded Jul 8',
    facts: [
      { label: 'Evidences', value: 'IM vendor settlement · Jun' },
      { label: 'Amount', value: '$1,375.00 · Tess 11h', mono: true },
      { label: 'Hash', value: 'sha256:4d8a2f6c…1f5b8d2a', mono: true },
    ],
  },
  'doc-tess-nda': {
    title: 'Tess-Fazio-NDA-signed.pdf',
    meta: 'Compliance · uploaded Feb 3',
    facts: [
      { label: 'Evidences', value: 'Tess Fazio NDA' },
      { label: 'Signed', value: 'Feb 3, 2026' },
      { label: 'Hash', value: 'sha256:9e5b1d7a…9c2e6f3b', mono: true },
    ],
  },
  'doc-finance-raw': {
    title: 'Varia_Finance Dashboard Data_RAW.xlsx',
    meta: 'Source data · uploaded Jul 27',
    facts: [
      { label: 'Evidences', value: 'Both extracted pay cycles' },
      { label: 'Cross-check', value: 'Asana exports · to the minute' },
      { label: 'Hash', value: 'sha256:1a7c3e9f…0b6d2a9c', mono: true },
    ],
  },
}
