/**
 * Hover summaries — strict spec: header = record type + name, max 4 rows,
 * each row = muted label + tabular value + optional as-of date. Footer is
 * "Open record →". No paragraphs, no loading states: these render
 * synchronously from memory. Matched payment records carry a `chain`
 * line showing the linked record chain.
 */

export interface SummaryRow {
  label: string
  value: string
  /** As-of date rendered after the value: "since Jun 2026 (was $60 Apr–May)" */
  asOf?: string
}

export interface RecordSummary {
  /** Record type shown in the header: "Person", "Client", "Pay cycle", … */
  type: string
  title: string
  /** Max 4 rows — enforced by convention here, sliced defensively in the card. */
  rows: SummaryRow[]
  /** Linked chain for matched payment records: "Payroll · Jun 16–30 cycle · view breakdown" */
  chain?: string
}

export const summaries: Record<string, RecordSummary> = {
  /* ── People ─────────────────────────────────────────────── */
  'abdullah-siddiqui': {
    type: 'Person',
    title: 'Abdullah Siddiqui',
    rows: [
      { label: 'Rate', value: '$70.00/h', asOf: 'since Jun 2026' },
      { label: 'Jul 1–15', value: '48.75h · $3,412.50' },
      { label: 'Jun 16–30', value: '53h · $3,710.00' },
      { label: 'Compliance', value: 'NDA · W-9 signed' },
    ],
  },
  'aditya-vyavahare': {
    type: 'Person',
    title: 'Aditya Vyavahare',
    rows: [
      { label: 'Rate', value: '$30.00/h', asOf: 'since Jun 2026' },
      { label: 'Jul 1–15', value: '16.47h · $494.00' },
      { label: 'Compliance', value: 'NDA · W-9 signed' },
    ],
  },
  arsalan: {
    type: 'Person',
    title: 'Arsalan',
    rows: [
      { label: 'Rate', value: '$100.00/h', asOf: 'since Jun 2026' },
      { label: 'Open ruling', value: 'RUL-002 · subtract 3h paid via IM?' },
      { label: 'Deferred', value: '51.5h · $5,150.00', asOf: 'Jun 16–30 · RUL-001' },
      { label: 'Last paid', value: '$600.00', asOf: 'Jul 21 · Mercury' },
    ],
  },
  'desiree-clark': {
    type: 'Person',
    title: 'Desirée Clark',
    rows: [
      { label: 'Rate', value: '$20.00/h', asOf: 'since Jun 2026' },
      { label: 'Jun 16–30', value: '11.2h · $224.00' },
      { label: 'Compliance', value: 'NDA · W-9 signed' },
    ],
  },
  'emily-hill': {
    type: 'Person',
    title: 'Emily Hill',
    rows: [
      { label: 'Rate', value: '$75.00/h', asOf: 'since Jun 2026 (was $60 Apr–May)' },
      { label: 'Jul 1–15', value: '23.17h · $1,737.50' },
      { label: 'Jun 16–30', value: '21.5h · $1,612.50' },
    ],
  },
  'harriett-wells': {
    type: 'Person',
    title: 'Harriett Wells',
    rows: [
      { label: 'Rate', value: '$30.00/h', asOf: 'since Jun 2026' },
      { label: 'Jul 1–15', value: '34.13h · $1,024.00' },
      { label: 'Jun 16–30', value: '35.83h · $1,075.00' },
    ],
  },
  'kayla-krasnow': {
    type: 'Person',
    title: 'Kayla Krasnow',
    rows: [
      { label: 'Rate', value: '$75.00/h', asOf: 'Jun backfilled · RUL-004' },
      { label: 'Jul 1–15', value: '19.42h · $1,456.25' },
    ],
  },
  'kirsten-conaster': {
    type: 'Person',
    title: 'Kirsten Conaster',
    rows: [
      { label: 'Rate', value: '$40.00/h', asOf: 'since Jun 2026' },
      { label: 'Jun 16–30', value: '1h · $40.00' },
      { label: 'Compliance', value: 'NDA · W-9 signed' },
    ],
  },
  'megan-breyer': {
    type: 'Person',
    title: 'Megan Breyer',
    rows: [
      { label: 'Rate', value: '$75.00/h', asOf: 'since Jun 2026 (3rd raise this year)' },
      { label: 'Jul 1–15', value: '27.5h · $2,062.50' },
      { label: 'Jun 16–30', value: '25.98h · $1,948.75' },
    ],
  },
  'miles-lorentzen': {
    type: 'Person',
    title: 'Miles Lorentzen',
    rows: [
      { label: 'Rate', value: '$20.00/h', asOf: 'Jun backfilled · RUL-004' },
      { label: 'Jul 1–15', value: '25.07h · $501.33' },
    ],
  },
  'sydney-allen': {
    type: 'Person',
    title: 'Sydney Allen',
    rows: [
      { label: 'Rate', value: '$60.00/h', asOf: 'since Jun 2026' },
      { label: 'Jul 1–15', value: '10.25h · $615.00' },
      { label: 'Role', value: 'prepares cycles · proposes rules' },
    ],
  },
  'tess-fazio': {
    type: 'Person',
    title: 'Tess Fazio',
    rows: [
      { label: 'Bill rate', value: '$125.00/h', asOf: 'IM-side · since Feb 2026' },
      { label: 'Jul accrual', value: '11.75h · $1,468.75 → IM' },
      { label: 'Jun accrual', value: '11h · $1,375.00', asOf: 'settled Jul 10' },
      { label: 'Compliance', value: 'NDA signed · W-9 missing' },
    ],
  },
  'zach-crew': {
    type: 'Person',
    title: 'Zach Crew',
    rows: [
      { label: 'Rate', value: '$15.00/h · tab only', asOf: 'RUL-003 backfill' },
      { label: 'Jun 16–30', value: '20h · $300.00' },
    ],
  },

  /* ── Counterparties ─────────────────────────────────────── */
  ecommission: {
    type: 'Counterparty',
    title: 'eCommission',
    rows: [
      { label: 'Role', value: 'client · The Matchbox' },
      { label: 'Retainer', value: '$4,500.00/mo · 22.5h', asOf: 'since Jan 2026' },
      { label: 'Open invoice', value: 'ECJun3026 · $5,400.00', asOf: 'due Jul 30' },
      { label: 'Rule', value: 'excludes Arsalan — billed via IM' },
    ],
  },
  celigo: {
    type: 'Counterparty',
    title: 'Celigo',
    rows: [
      { label: 'Role', value: 'client · The Matchbox' },
      { label: 'Retainer', value: '$7,500.00/mo · 33h', asOf: 'since Mar 2026' },
      { label: 'Overage', value: '$225.00/h' },
      { label: 'Last paid', value: 'CELJul2026', asOf: 'Jul 14 · Mercury ACH' },
    ],
  },
  'maxwell-social': {
    type: 'Counterparty',
    title: 'Maxwell Social',
    rows: [
      { label: 'Role', value: 'client · The Matchbox' },
      { label: 'Jun billed', value: '50.0h · $7,000.00' },
      { label: 'Received', value: '$4,620.00 partial', asOf: 'Jul 5' },
      { label: 'Balance', value: '$2,380.00 open' },
    ],
  },
  'pineapple-family': {
    type: 'Counterparty',
    title: 'Pineapple Family',
    rows: [
      { label: 'Role', value: 'client · The Matchbox' },
      { label: 'Status', value: 'missing terms — flagged in queue' },
      { label: 'Open invoice', value: 'PFJul2026 · $2,700.00', asOf: 'disputed' },
      { label: 'Last ruling', value: '1.5h overage waived', asOf: 'Jul 24' },
    ],
  },
  hubspot: {
    type: 'Counterparty',
    title: 'HubSpot',
    rows: [
      { label: 'Roles', value: 'vendor + commission source' },
      { label: 'Vendor', value: 'SaaS seats · The Matchbox', asOf: 'since Feb 2026' },
      { label: 'Commission', value: 'partner payouts', asOf: 'since May 2026' },
      { label: 'Last payout', value: 'fees pending reconcile', asOf: 'Jun stmt' },
    ],
  },
  'interrupt-media': {
    type: 'Counterparty',
    title: 'Interrupt Media',
    rows: [
      { label: 'Roles', value: 'vendor + partner' },
      { label: 'Vendor', value: 'subcontracted labor', asOf: 'since Apr 2026' },
      { label: 'Jun invoice', value: '$1,375.00 · Tess 11h', asOf: 'settled Jul 10' },
      { label: 'Open item', value: 'RUL-002 · 3h Arsalan overlap' },
    ],
  },
  'rebld-ai': {
    type: 'Counterparty',
    title: 'Rebld.ai',
    rows: [
      { label: 'Role', value: 'customer · The Ad Spend' },
      { label: 'Aka', value: 'HiJenny', asOf: 'renamed May 2026' },
      { label: 'Stream', value: 'self-serve subscription', asOf: 'since May 2026' },
    ],
  },
  soundexchange: {
    type: 'Counterparty',
    title: 'SoundExchange',
    rows: [
      { label: 'Role', value: 'royalty source · 2 entities' },
      { label: 'Spyll World', value: 'sound-recording royalties', asOf: 'since Jan 2026' },
      { label: 'Spyll Publishing', value: 'publishing-share royalties', asOf: 'since Jan 2026' },
    ],
  },

  /* ── Pay cycles ─────────────────────────────────────────── */
  '2026-06-H2': {
    type: 'Pay cycle',
    title: 'Jun 16–30',
    rows: [
      { label: 'Payable', value: '$11,344.92 · 12 people', asOf: 'paid Jul 15' },
      { label: 'Vendor accrual', value: '$1,375.00 → Interrupt Media' },
      { label: 'Deferred out', value: 'Arsalan 51.5h · $5,150.00', asOf: 'RUL-001' },
    ],
  },
  '2026-07-H1': {
    type: 'Pay cycle',
    title: 'Jul 1–15',
    rows: [
      { label: 'Payable', value: '$14,953.08 · 9 people', asOf: 'to be paid Jul 31' },
      { label: 'Vendor accrual', value: '$1,468.75 → Interrupt Media' },
      { label: 'Pending', value: '$5,150.00 or $4,850.00', asOf: 'RUL-002' },
    ],
  },

  /* ── Invoices ───────────────────────────────────────────── */
  'inv-ecmay3126': {
    type: 'Invoice',
    title: 'ECMay3126',
    rows: [
      { label: 'Total', value: '$18,500.00', asOf: 'issued May 31' },
      { label: 'Received', value: '$18,500.00', asOf: 'Jul 26 · Mercury ACH' },
      { label: 'Bank row', value: 'ECOMMISSION INC', asOf: 'posted Jul 26' },
    ],
  },
  'inv-ecjun3026': {
    type: 'Invoice',
    title: 'ECJun3026',
    rows: [
      { label: 'Total', value: '$5,400.00', asOf: 'issued Jun 30' },
      { label: 'Due', value: 'Jul 30' },
      { label: 'Includes', value: 'overage 4.5h @ $200.00/h' },
    ],
  },
  'inv-mxjun2026': {
    type: 'Invoice',
    title: 'MXJun2026',
    rows: [
      { label: 'Total', value: '$7,000.00', asOf: 'issued Jun 30' },
      { label: 'Received', value: '$4,620.00', asOf: 'Jul 5' },
      { label: 'Balance', value: '$2,380.00 open' },
    ],
  },
  'inv-celjul2026': {
    type: 'Invoice',
    title: 'CELJul2026',
    rows: [
      { label: 'Total', value: '$7,500.00', asOf: 'issued Jul 1' },
      { label: 'Received', value: '$7,500.00', asOf: 'Jul 14 · Mercury ACH' },
      { label: 'Terms', value: 'Net 15 · retainer' },
    ],
  },
  'inv-pfjul2026': {
    type: 'Invoice',
    title: 'PFJul2026',
    rows: [
      { label: 'Total', value: '$2,700.00', asOf: 'issued Jul 20' },
      { label: 'Dispute', value: 'client contests 1.5h overage' },
      { label: 'Related', value: 'overage waived in queue', asOf: 'Jul 24' },
    ],
  },
  'inv-ecjul3126': {
    type: 'Invoice',
    title: 'ECJul3126',
    rows: [
      { label: 'Total', value: '$4,500.00', asOf: 'draft' },
      { label: 'Covers', value: 'monthly retainer · Jul' },
      { label: 'State', value: 'not yet issued' },
    ],
  },
  'inv-mxapr2026': {
    type: 'Invoice',
    title: 'MXApr2026',
    rows: [
      { label: 'Total', value: '$5,175.00', asOf: 'issued Apr 30' },
      { label: 'Voided', value: 'superseded — wrong rate applied' },
      { label: 'Replaced by', value: 'corrected April invoice' },
    ],
  },

  /* ── Payments (matched — carry the linked chain) ─────────── */
  'pay-ecmay3126': {
    type: 'Payment',
    title: '$18,500.00 received',
    rows: [
      { label: 'Received', value: '$18,500.00', asOf: 'Jul 26 · Mercury ACH' },
      { label: 'Applied to', value: 'ECMay3126 · paid in full' },
      { label: 'Bank row', value: 'ECOMMISSION INC', asOf: 'posted Jul 26' },
    ],
    chain: 'Invoice · ECMay3126 · view billing',
  },
  'pay-celjul2026': {
    type: 'Payment',
    title: '$7,500.00 received',
    rows: [
      { label: 'Received', value: '$7,500.00', asOf: 'Jul 14 · Mercury ACH' },
      { label: 'Applied to', value: 'CELJul2026 · paid in full' },
      { label: 'Bank row', value: 'CELIGO INC', asOf: 'posted Jul 14' },
    ],
    chain: 'Invoice · CELJul2026 · view billing',
  },
  'pay-mxjun2026': {
    type: 'Payment',
    title: '$4,620.00 received',
    rows: [
      { label: 'Received', value: '$4,620.00', asOf: 'Jul 5 · Mercury ACH' },
      { label: 'Applied to', value: 'MXJun2026 · partial' },
      { label: 'Balance', value: '$2,380.00 open' },
    ],
    chain: 'Invoice · MXJun2026 · view billing',
  },

  /* ── Bank transactions (matched — carry the linked chain) ── */
  'bt-jul15-payroll': {
    type: 'Bank transaction',
    title: 'PAYROLL RUN · JUN 16–30',
    rows: [
      { label: 'Amount', value: '-$10,744.92', asOf: 'posted Jul 15' },
      { label: 'Covers', value: '12 contractors' },
      { label: 'Account', value: 'The Matchbox checking' },
    ],
    chain: 'Payroll · Jun 16–30 cycle · view breakdown',
  },
  'bt-jul21-arsalan': {
    type: 'Bank transaction',
    title: 'SYED ARSALAN RAZA',
    rows: [
      { label: 'Amount', value: '-$600.00', asOf: 'posted Jul 21' },
      { label: 'Covers', value: 'Jun 1–15 · 6h @ $100.00/h' },
      { label: 'Reference', value: '9f1d882e…ec221a' },
    ],
    chain: 'Payroll · Jun 1–15 catch-up · view breakdown',
  },
  'bt-jul26-ecom': {
    type: 'Bank transaction',
    title: 'ECOMMISSION INC',
    rows: [
      { label: 'Amount', value: '$18,500.00', asOf: 'posted Jul 26' },
      { label: 'Matched to', value: 'ECMay3126 · paid in full' },
      { label: 'Account', value: 'The Matchbox checking' },
    ],
    chain: 'Invoice · ECMay3126 · view billing',
  },
  'bt-jul14-celigo': {
    type: 'Bank transaction',
    title: 'CELIGO INC',
    rows: [
      { label: 'Amount', value: '$7,500.00', asOf: 'posted Jul 14' },
      { label: 'Matched to', value: 'CELJul2026 · paid in full' },
      { label: 'Account', value: 'The Matchbox checking' },
    ],
    chain: 'Invoice · CELJul2026 · view billing',
  },
  'bt-jul10-im': {
    type: 'Bank transaction',
    title: 'INTERRUPT MEDIA LLC',
    rows: [
      { label: 'Amount', value: '-$1,375.00', asOf: 'posted Jul 10' },
      { label: 'Covers', value: 'Tess Fazio · Jun · 11h' },
      { label: 'Account', value: 'The Matchbox checking' },
    ],
    chain: 'Vendor settlement · Jun 16–30 cycle · view breakdown',
  },
  'bt-jul05-maxwell': {
    type: 'Bank transaction',
    title: 'MAXWELL SOCIAL',
    rows: [
      { label: 'Amount', value: '$4,620.00', asOf: 'posted Jul 5' },
      { label: 'Matched to', value: 'MXJun2026 · partial' },
      { label: 'Balance', value: '$2,380.00 open' },
    ],
    chain: 'Invoice · MXJun2026 · view billing',
  },

  /* ── Documents ──────────────────────────────────────────── */
  'doc-payout-tracker': {
    type: 'Document',
    title: 'CONTRACTOR PAYOUT TRACKER.xlsx',
    rows: [
      { label: 'Kind', value: 'statement', asOf: 'uploaded Jul 27' },
      { label: 'Evidences', value: 'Jun 16–30 · Jul 1–15 cycles' },
      { label: 'Hash', value: 'sha256:8f3a1c2e…f6e5d4' },
    ],
  },
  'doc-mercury-jun': {
    type: 'Document',
    title: 'mercury-statement-2026-06.pdf',
    rows: [
      { label: 'Kind', value: 'statement', asOf: 'uploaded Jul 2' },
      { label: 'Evidences', value: 'Jun payroll · Arsalan catch-up' },
      { label: 'Hash', value: 'sha256:2b9e7d4f…a3c0e7b' },
    ],
  },
  'doc-ecom-msa': {
    type: 'Document',
    title: 'eCommission-MSA-2026.pdf',
    rows: [
      { label: 'Kind', value: 'contract', asOf: 'uploaded Jan 12' },
      { label: 'Evidences', value: 'retainer + migration terms' },
      { label: 'Effective', value: 'Jan 2026' },
    ],
  },
  'doc-im-invoice-jun': {
    type: 'Document',
    title: 'InterruptMedia-TMB-June.pdf',
    rows: [
      { label: 'Kind', value: 'invoice', asOf: 'uploaded Jul 8' },
      { label: 'Amount', value: '$1,375.00 · Tess 11h' },
      { label: 'Evidences', value: 'IM vendor settlement · Jun' },
    ],
  },
  'doc-tess-nda': {
    type: 'Document',
    title: 'Tess-Fazio-NDA-signed.pdf',
    rows: [
      { label: 'Kind', value: 'compliance', asOf: 'uploaded Feb 3' },
      { label: 'Signed', value: 'Feb 3, 2026' },
      { label: 'Evidences', value: 'Tess Fazio NDA' },
    ],
  },
  'doc-finance-raw': {
    type: 'Document',
    title: 'Varia_Finance Dashboard Data_RAW.xlsx',
    rows: [
      { label: 'Kind', value: 'source data', asOf: 'uploaded Jul 27' },
      { label: 'Evidences', value: 'both extracted pay cycles' },
      { label: 'Cross-check', value: 'Asana exports · to the minute' },
    ],
  },

  /* ── Rulings ────────────────────────────────────────────── */
  'RUL-001': {
    type: 'Ruling',
    title: 'RUL-001 · Arsalan deferral',
    rows: [
      { label: 'Decision', value: 'Defer 51.5h · $5,150.00', asOf: 'Ani · Jul 27' },
      { label: 'From', value: 'Jun 16–30 cycle' },
      { label: 'To', value: 'Jul 1–15 · pays Jul 31' },
      { label: 'Evidence', value: 'Mercury · only $600.00 paid', asOf: 'Jul 10–27' },
    ],
    chain: 'Payroll · Jun 16–30 cycle · view breakdown',
  },
  'RUL-002': {
    type: 'Ruling',
    title: 'RUL-002 · IM 3h overlap',
    rows: [
      { label: 'Status', value: 'Open — pick before Jul 31 run' },
      { label: 'Option A', value: 'Pay full 51.5h · $5,150.00' },
      { label: 'Option B', value: 'Apply −3h via IM · $4,850.00' },
      { label: 'Source', value: 'Sheet note · never applied', asOf: 'Jun F4 / Jul F13' },
    ],
    chain: 'Payroll · Jul 1–15 cycle · view breakdown',
  },
  'RUL-003': {
    type: 'Ruling',
    title: 'RUL-003 · Zach rate backfill',
    rows: [
      { label: 'Decision', value: 'Tab rate is truth · $15.00/h' },
      { label: 'Gap', value: 'Absent from Rate Card both months' },
      { label: 'Applied to', value: 'Jun 16–30 cycle tab only' },
    ],
  },
  'RUL-004': {
    type: 'Ruling',
    title: 'RUL-004 · June rate card backfill',
    rows: [
      { label: 'Decision', value: 'Backfill Jun from Jul card' },
      { label: 'People', value: 'Abdullah · Kayla · Miles' },
      { label: 'Gap', value: 'Missing from 2026-06 Rate Card' },
    ],
  },
}
