/**
 * Varia Finance — domain types.
 * v0 phase: fixtures conform to these interfaces; components are dumb
 * (props in, events out). Every displayed number is precomputed as a
 * display string in fixtures, including human-readable calculation traces.
 * Claude reconciles these types when wiring the real backend.
 */

// ---------- Shared primitives ----------

export type EntityId = 'varia-global' | 'the-matchbox' | 'spyll-world' | 'the-ad-spend'

export interface Period {
  id: string // e.g. "2026-07" or "2026-07-H2"
  label: string // e.g. "Jul 2026" or "Jul 16–31"
  start: string // ISO date
  end: string // ISO date
}

/** Precomputed display money — no math in components, ever. */
export interface Money {
  display: string // "$13,402.25" — always cents
  cents: number // for sorting only, never arithmetic in UI
  currency: 'USD'
}

export type WorkItemStatus =
  | 'prepared'
  | 'suggestion'
  | 'needs_decision'
  | 'variance'
  | 'review'
  | 'held'

export type WorkItemType =
  | 'pay_cycle'
  | 'bank_match'
  | 'overage'
  | 'invoice_variance'
  | 'card_statement'
  | 'missing_contract'

// ---------- Queue ----------

export interface AiSuggestion {
  id: string
  confidence: number // 0–100, precomputed
  confidenceDisplay: string // "92%"
  summary: string // "HubSpot payout Jul 24 = $7,190.00 gross − $214.75 fees"
  source: string // "Mercury + HubSpot payouts"
}

export interface WorkItemAction {
  id: string
  label: string // "Approve", "Accept match", "Waive"
  intent: 'primary' | 'secondary' | 'destructive'
  /** Money-bearing: must open a confirm dialog before recording. */
  money: boolean
  requiresReason?: boolean
  /** Exact statement of what will be recorded, shown in the confirm dialog. */
  confirm?: {
    title: string
    records: string[] // bullet lines: exactly what gets recorded
  }
  /** Approving removes the item from the queue. */
  resolves: boolean
}

export interface WorkItemEvidence {
  label: string
  value: string
  mono?: boolean // render in Geist Mono (amounts, traces, ids)
}

export interface WorkItemHistoryEvent {
  at: string // "Jul 24, 09:12"
  actor: string // "System", "Sydney Allen"
  event: string
}

export interface WorkItem {
  id: string
  type: WorkItemType
  status: WorkItemStatus
  title: string
  /** Middle-dot metadata segments: ["The Matchbox", "Jul 16–31", "14 people"] */
  meta: string[]
  /** Optional monospace calculation trace, precomputed. */
  trace?: string
  amount?: Money
  aiSuggestion?: AiSuggestion
  actions: WorkItemAction[] // 1–3 decision buttons
  evidence: WorkItemEvidence[]
  history: WorkItemHistoryEvent[]
  /** Filter tags for the chip model. */
  tags: {
    entity: EntityId
    client?: string
    people?: string[]
    period?: string
    status: WorkItemStatus
  }
  createdAt: string // "Jul 24"
}

// ---------- People / rates / routing ----------

export interface RateCard {
  id: string
  personId: string
  rateDisplay: string // "$60.00/h"
  effectiveFrom: string // "Apr 2026"
  effectiveTo?: string
  proposedBy?: string
  confirmedBy?: string
}

export interface PayeeRouting {
  personId: string
  mode: 'direct' | 'routed'
  routedVia?: string // "Interrupt Media"
  clientRateDisplay?: string // "$125.00/h"
}

export interface Person {
  id: string
  name: string
  role: string
  entity: EntityId
  rateHistory: RateCard[]
  routing: PayeeRouting
  complianceDocs: { kind: 'NDA' | 'W-9'; status: 'signed' | 'missing' }[]
}

// ---------- Clients / contracts ----------

export interface ContractRule {
  id: string
  label: string // "excludes Arsalan — billed via IM"
  kind: 'exclusion' | 'exemption' | 'routing'
  activeUntil?: string
}

export interface ContractTerms {
  id: string
  summary: string // "$4,500/mo retainer · 22.5h included · $200/h overage"
  retainerDisplay?: string
  includedHoursDisplay?: string
  overageRateDisplay?: string
  fixedFeeDisplay?: string
  effectiveFrom: string
}

export interface Contract {
  id: string
  clientId: string
  name: string
  kind: 'retainer' | 'fixed'
  status: 'active' | 'ended' | 'missing_terms'
  terms: ContractTerms[]
  rules: ContractRule[]
}

export interface Client {
  id: string
  name: string
  entity: EntityId
  contracts: Contract[]
  /** Precomputed monthly hours where relevant: { "Apr": "45.0h", ... } */
  hoursByMonth?: Record<string, string>
}

// ---------- Pay cycles ----------

export interface Adjustment {
  id: string
  kind: 'bonus' | 'commission' | 'reimbursement'
  label: string
  amount: Money
}

export interface PayCycleLine {
  id: string
  personId: string
  personName: string
  hoursDisplay: string // "41.25h"
  originPeriodLabel: string // true period for late timesheets
  rateCardId: string
  rateDisplay: string
  amount: Money
  adjustments: Adjustment[]
  excluded: boolean // IM-routed: shown but excluded from payable total
  excludedReason?: string
  hold?: { reason: string } // "do not pay until NDA signed"
}

export interface PayCycle {
  id: string
  entity: EntityId
  period: Period
  payDate: string
  status: 'draft' | 'prepared' | 'approved' | 'paid' | 'reconciled'
  lines: PayCycleLine[]
  payableTotal: Money // precomputed
  excludedCount: number
  peopleCount: number
}

// ---------- Invoicing / payments ----------

export interface InvoiceLine {
  id: string
  description: string
  amount: Money
}

export interface Invoice {
  id: string
  clientId: string
  number: string // "ECMay3126"
  status:
    | 'draft'
    | 'sent'
    | 'partially_paid'
    | 'paid'
    | 'disputed'
    | 'credit_note'
    | 'void'
  lines: InvoiceLine[]
  total: Money
  issuedAt: string
  dueAt?: string
}

export interface Payment {
  id: string
  invoiceId?: string
  amount: Money
  receivedAt: string
  method: string // "Mercury ACH"
}

export interface PayoutBatch {
  id: string
  payCycleId: string
  status: 'pending' | 'sent' | 'settled'
  total: Money
  sentAt?: string
}

// ---------- Banking / reconciliation ----------

export interface BankTransaction {
  id: string
  account: string // "The Matchbox checking"
  entity: EntityId
  direction: 'credit' | 'debit'
  amount: Money
  description: string
  createdAt: string
  postedAt: string
  matched: boolean
}

export interface TransactionMatch {
  id: string
  bankTransactionId: string
  /** N:1 supported — one deposit can cover several invoices. */
  invoiceIds: string[]
  confidence?: number
  acceptedBy?: string
  acceptedAt?: string
}

export interface IntercompanyTransfer {
  id: string
  fromEntity: EntityId
  toEntity: EntityId
  amount: Money
  legs: { entity: EntityId; bankTransactionId: string }[]
  netToZero: boolean
}

// ---------- Documents / audit ----------

export interface DocumentRef {
  id: string
  name: string
  kind: 'contract' | 'statement' | 'invoice' | 'compliance' | 'other'
  hash: string // content hash for duplicate rejection
  uploadedAt: string
  evidences: string[] // ids of records this document evidences
}

export interface AuditEvent {
  id: string
  at: string
  actor: string
  action: string // "approved pay cycle", "accepted match"
  objectType: string
  objectId: string
  before?: string
  after?: string
}

// ---------- Workspace (shell) ----------

export interface Entity {
  id: EntityId
  name: string
}

export type UserRole = 'owner' | 'finance' | 'accountant'

export interface AppUser {
  id: string
  name: string
  role: UserRole
  roleLabel: string // "owner / approver"
  canApprove: boolean
}

export type FilterKind = 'entity' | 'client' | 'person' | 'period' | 'status'

export interface FilterChip {
  id: string
  kind: FilterKind
  label: string // "The Matchbox"
  value: string // "the-matchbox"
}

export interface SavedView {
  id: string
  name: string
  chips: FilterChip[]
}
