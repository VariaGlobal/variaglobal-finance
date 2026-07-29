/**
 * Fixtures for the Settings/Admin section. Display-only — no live
 * connections. A backend engineer wires real sources later.
 */

/* ── 01 Integrations ─────────────────────────────────────────────── */

export type IntegrationHealth = 'healthy' | 'degraded' | 'down'

export interface Integration {
  id: string
  name: string
  scope: string // which entities/portals this connection covers
  health: IntegrationHealth
  healthNote: string
  credentialAgeDays: number
  rotateAfterDays: number
  lastSync: string
  recordsIngested: number
  webhookHeartbeat: string // last heartbeat, or '—' if polling only
  paused: boolean
}

export const integrations: Integration[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    scope: 'The Matchbox · Spyll World',
    health: 'healthy',
    healthNote: 'All accounts syncing',
    credentialAgeDays: 41,
    rotateAfterDays: 90,
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
    credentialAgeDays: 87,
    rotateAfterDays: 90,
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
    credentialAgeDays: 12,
    rotateAfterDays: 180,
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
    credentialAgeDays: 63,
    rotateAfterDays: 90,
    lastSync: 'Jul 26, 22:00',
    recordsIngested: 48,
    webhookHeartbeat: '—',
    paused: true,
  },
]

/* ── 02 Rules ────────────────────────────────────────────────────── */

export interface RateCardRow {
  id: string
  subject: string // person or client the rate applies to
  rate: string // display string, mono
  basis: string // e.g. 'hourly', 'monthly retainer', '% of spend'
  effectiveFrom: string
  effectiveTo: string | null // null = open-ended
}

export interface RuleTable {
  id: string
  title: string
  kind: 'rate-card' | 'contract-terms'
  rows: RateCardRow[]
  /** A pending proposal on this table, if any. */
  pending?: {
    proposedBy: string
    proposedAt: string
    change: { rowSubject: string; field: string; from: string; to: string }
    awaiting: string
  }
}

export const ruleTables: RuleTable[] = [
  {
    id: 'contractor-rates',
    title: 'Contractor rate card',
    kind: 'rate-card',
    rows: [
      { id: 'r1', subject: 'Megan Breyer', rate: '$95.00/hr', basis: 'hourly', effectiveFrom: 'Jan 1, 2026', effectiveTo: null },
      { id: 'r2', subject: 'Tess Fazio', rate: '$85.00/hr', basis: 'hourly', effectiveFrom: 'Mar 1, 2026', effectiveTo: null },
      { id: 'r3', subject: 'Michael Hood', rate: '$110.00/hr', basis: 'hourly', effectiveFrom: 'Jan 1, 2026', effectiveTo: 'Jun 30, 2026' },
      { id: 'r4', subject: 'Michael Hood', rate: '$120.00/hr', basis: 'hourly', effectiveFrom: 'Jul 1, 2026', effectiveTo: null },
    ],
    pending: {
      proposedBy: 'Sydney',
      proposedAt: 'Jul 25, 14:02',
      change: { rowSubject: 'Tess Fazio', field: 'rate', from: '$85.00/hr', to: '$92.50/hr' },
      awaiting: 'Ani',
    },
  },
  {
    id: 'client-terms',
    title: 'Client contract terms',
    kind: 'contract-terms',
    rows: [
      { id: 'c1', subject: 'eCommission', rate: '$18,500.00/mo', basis: 'monthly retainer', effectiveFrom: 'Feb 1, 2026', effectiveTo: null },
      { id: 'c2', subject: 'Celigo', rate: '$12,000.00/mo', basis: 'monthly retainer', effectiveFrom: 'Jan 1, 2026', effectiveTo: null },
      { id: 'c3', subject: 'Maxwell Social', rate: '12.0%', basis: '% of managed spend', effectiveFrom: 'Apr 1, 2026', effectiveTo: null },
      { id: 'c4', subject: 'Pineapple Family', rate: '$6,400.00/mo', basis: 'monthly retainer', effectiveFrom: 'May 1, 2026', effectiveTo: 'Oct 31, 2026' },
    ],
  },
]

/* ── 03 Users & roles ────────────────────────────────────────────── */

export interface RoleCard {
  id: string
  name: string
  role: string
  capabilities: { label: string; allowed: boolean }[]
}

export const roleCards: RoleCard[] = [
  {
    id: 'ani',
    name: 'Ani',
    role: 'Owner / approver',
    capabilities: [
      { label: 'Approve money movements', allowed: true },
      { label: 'Confirm rule changes', allowed: true },
      { label: 'Manage users and integrations', allowed: true },
      { label: 'Edit records directly', allowed: false },
    ],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    role: 'Finance',
    capabilities: [
      { label: 'Prepare and propose everything', allowed: true },
      { label: 'Propose rule changes', allowed: true },
      { label: 'Run backfills and pauses', allowed: true },
      { label: 'Approve money movements', allowed: false },
    ],
  },
  {
    id: 'am',
    name: 'Account managers',
    role: 'AM',
    capabilities: [
      { label: 'View own client records', allowed: true },
      { label: 'Flag variances for review', allowed: true },
      { label: 'See rates or margins', allowed: false },
      { label: 'Approve or propose changes', allowed: false },
    ],
  },
  {
    id: 'lauraine',
    name: 'Lauraine',
    role: 'Accountant',
    capabilities: [
      { label: 'Read every record and report', allowed: true },
      { label: 'Export close packages', allowed: true },
      { label: 'Modify any record', allowed: false },
      { label: 'Approve money movements', allowed: false },
    ],
  },
]

/* ── 04 Prompt library ───────────────────────────────────────────── */

export interface PromptVersion {
  version: string
  date: string
  note: string // one-line diff summary
}

export interface PromptRecord {
  id: string
  name: string
  purpose: string
  model: string
  currentVersion: string
  usedBySuggestions: number
  history: PromptVersion[]
}

export const prompts: PromptRecord[] = [
  {
    id: 'txn-categorize',
    name: 'Transaction categorizer',
    purpose: 'Assigns Mercury transactions to ledger categories with a confidence score.',
    model: 'anthropic/claude-sonnet-4.5',
    currentVersion: 'v4',
    usedBySuggestions: 1121,
    history: [
      { version: 'v4', date: 'Jul 18, 2026', note: '+ vendor-alias table; confidence floor 0.72 → 0.80' },
      { version: 'v3', date: 'Jun 02, 2026', note: '+ entity context (Matchbox vs Spyll); − legacy category list' },
      { version: 'v2', date: 'Apr 21, 2026', note: '+ few-shot examples for ad-spend passthroughs' },
      { version: 'v1', date: 'Mar 10, 2026', note: 'Initial prompt' },
    ],
  },
  {
    id: 'variance-explain',
    name: 'Variance explainer',
    purpose: 'Drafts a plain-English explanation when actuals diverge from contract terms.',
    model: 'anthropic/claude-sonnet-4.5',
    currentVersion: 'v2',
    usedBySuggestions: 87,
    history: [
      { version: 'v2', date: 'Jul 05, 2026', note: '+ cites the exact rate-card row; tighter length cap' },
      { version: 'v1', date: 'May 28, 2026', note: 'Initial prompt' },
    ],
  },
  {
    id: 'invoice-draft',
    name: 'Invoice line drafter',
    purpose: 'Builds invoice line items from approved time entries and retainer schedules.',
    model: 'openai/gpt-5',
    currentVersion: 'v3',
    usedBySuggestions: 342,
    history: [
      { version: 'v3', date: 'Jul 22, 2026', note: '+ groups by project; rounds to contract increments' },
      { version: 'v2', date: 'Jun 14, 2026', note: '+ retainer proration rules' },
      { version: 'v1', date: 'Apr 30, 2026', note: 'Initial prompt' },
    ],
  },
]

/* ── 05 Architecture ─────────────────────────────────────────────── */

export interface ArchStage {
  id: string
  number: string
  title: string
  items: string[]
  docHref: string
  docLabel: string
}

export const archStages: ArchStage[] = [
  {
    id: 'sources',
    number: '01',
    title: 'Sources',
    items: ['Mercury', 'HubSpot', 'Asana', 'PandaDoc'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/sources.md',
    docLabel: 'docs/sources.md',
  },
  {
    id: 'pipelines',
    number: '02',
    title: 'Pipelines',
    items: ['Sync jobs', 'Webhook ingestion', 'Backfill runner'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/pipelines.md',
    docLabel: 'docs/pipelines.md',
  },
  {
    id: 'records',
    number: '03',
    title: 'Records',
    items: ['Transactions', 'Time entries', 'Contracts', 'Invoices'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/records.md',
    docLabel: 'docs/records.md',
  },
  {
    id: 'engines',
    number: '04',
    title: 'Engines',
    items: ['Categorizer', 'Variance detector', 'Pay-cycle builder'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/engines.md',
    docLabel: 'docs/engines.md',
  },
  {
    id: 'queue',
    number: '05',
    title: 'Queue',
    items: ['Work items', 'Approvals', 'Audit trail'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/queue.md',
    docLabel: 'docs/queue.md',
  },
  {
    id: 'views',
    number: '06',
    title: 'Views',
    items: ['Records hubs', 'Reports', 'Close packages'],
    docHref: 'https://github.com/VariaGlobal/variaglobal-finance/blob/main/docs/views.md',
    docLabel: 'docs/views.md',
  },
]

/* ── 06 System health ────────────────────────────────────────────── */

export interface BackupStatus {
  id: string
  name: string
  detail: string
  lastPoint: string
  status: 'ok' | 'attention'
}

export const backups: BackupStatus[] = [
  {
    id: 'neon-pitr',
    name: 'Neon point-in-time recovery',
    detail: '7-day PITR window on the primary branch',
    lastPoint: 'Continuous · as of 06:15 today',
    status: 'ok',
  },
  {
    id: 'blob-mirror',
    name: 'Blob mirror',
    detail: 'Documents and statements mirrored nightly',
    lastPoint: 'Jul 27, 02:00',
    status: 'ok',
  },
  {
    id: 'close-snapshot',
    name: 'Last close snapshot',
    detail: 'Immutable export of the Jun 2026 close',
    lastPoint: 'Jul 03, 18:41',
    status: 'attention',
  },
]

export interface StalenessRule {
  id: string
  source: string
  threshold: string
  notify: string
  enabled: boolean
}

export const stalenessRules: StalenessRule[] = [
  { id: 's1', source: 'Mercury sync', threshold: '> 2 hours stale', notify: 'Sydney', enabled: true },
  { id: 's2', source: 'HubSpot portals', threshold: '> 6 hours stale', notify: 'Sydney', enabled: true },
  { id: 's3', source: 'Asana time entries', threshold: '> 24 hours stale', notify: 'Sydney', enabled: true },
  { id: 's4', source: 'PandaDoc contracts', threshold: '> 7 days stale', notify: 'Ani · Sydney', enabled: false },
]

/* ── 07 Admin ────────────────────────────────────────────────────── */

export interface EntityRecord {
  id: string
  name: string
  kind: string
  status: 'active' | 'dormant'
  accounts: string // banking scope summary
}

export const entityRegistry: EntityRecord[] = [
  { id: 'varia-global', name: 'Varia Global', kind: 'Holding · consolidated view', status: 'active', accounts: 'No direct accounts' },
  { id: 'the-matchbox', name: 'The Matchbox', kind: 'Operating LLC', status: 'active', accounts: 'Mercury checking · savings' },
  { id: 'spyll-world', name: 'Spyll World', kind: 'Operating LLC', status: 'active', accounts: 'Mercury checking' },
  { id: 'the-ad-spend', name: 'The Ad Spend', kind: 'Media pass-through', status: 'active', accounts: 'Client-funded cards' },
]

export interface ApprovalThreshold {
  id: string
  scope: string
  rule: string
  approver: string
}

export const approvalThresholds: ApprovalThreshold[] = [
  { id: 't1', scope: 'Pay cycles', rule: 'Any amount — always confirmed', approver: 'Ani' },
  { id: 't2', scope: 'Vendor payments', rule: '≥ $1,000.00 requires confirm', approver: 'Ani' },
  { id: 't3', scope: 'Bank match accept', rule: 'Confidence < 90% requires review', approver: 'Sydney' },
  { id: 't4', scope: 'Rule changes', rule: 'Propose → confirm, never direct', approver: 'Sydney → Ani' },
]

export interface RetentionRule {
  id: string
  record: string
  policy: string
}

export const retentionRules: RetentionRule[] = [
  { id: 'ret1', record: 'Financial records & audit trail', policy: 'Retained indefinitely — never purged' },
  { id: 'ret2', record: 'Source documents (statements, contracts)', policy: '7 years after entity close' },
  { id: 'ret3', record: 'AI suggestion traces', policy: '24 months rolling' },
  { id: 'ret4', record: 'Session & access logs', policy: '12 months rolling' },
]

/* ── 08 Audit ────────────────────────────────────────────────────── */

export interface AuditRow {
  id: string
  at: string
  actor: string
  action: string
  object: string
  before?: string
  after?: string
}

export const auditRows: AuditRow[] = [
  { id: 'a1', at: 'Jul 27, 06:12', actor: 'System', action: 'ingested Mercury sync', object: '41 transactions · The Matchbox', after: '41 new records' },
  { id: 'a2', at: 'Jul 26, 17:03', actor: 'Ani', action: 'approved pay cycle', object: 'Jul 1–15 · The Matchbox', before: 'prepared', after: 'approved · frozen' },
  { id: 'a3', at: 'Jul 26, 16:48', actor: 'Sydney', action: 'accepted bank match', object: 'Deposit $18,500.00 → ECMay3126', before: 'unmatched', after: 'matched · 96%' },
  { id: 'a4', at: 'Jul 25, 14:02', actor: 'Sydney', action: 'proposed rate change', object: 'Tess Fazio · contractor rate card', before: '$85.00/hr', after: '$92.50/hr · awaiting Ani' },
  { id: 'a5', at: 'Jul 25, 09:30', actor: 'System', action: 'flagged variance', object: 'Celigo retainer vs actuals · Jul', after: 'work item created' },
  { id: 'a6', at: 'Jul 24, 11:15', actor: 'Ani', action: 'waived overage', object: 'Pineapple Family · 1.5h over', before: '$300.00 billable', after: 'waived · reason recorded' },
  { id: 'a7', at: 'Jul 23, 15:40', actor: 'Sydney', action: 'ran backfill', object: 'HubSpot payouts · Jul 1–20', after: '132 records ingested' },
  { id: 'a8', at: 'Jul 22, 10:05', actor: 'Lauraine', action: 'exported close package', object: 'Jun 2026 · all entities', after: 'immutable snapshot' },
]
