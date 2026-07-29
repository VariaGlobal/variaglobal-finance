/**
 * Drizzle schema — Phase 1 core. Append-only discipline is enforced by the
 * write paths (no UPDATE on fact rows; corrections supersede), and later by
 * revoking UPDATE/DELETE grants in Postgres itself.
 */

import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const people = pgTable('people', {
  id: text('id').primaryKey(), // slug, e.g. 'tess-fazio'
  name: text('name').notNull(),
})

export const rateCards = pgTable(
  'rate_cards',
  {
    id: serial('id').primaryKey(),
    person: text('person').notNull(),
    month: text('month').notNull(), // 'YYYY-MM'
    rateCents: integer('rate_cents').notNull(),
    source: text('source').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('rate_cards_person_month_rate_uq').on(t.person, t.month, t.rateCents)],
)

export const payeeRoutings = pgTable('payee_routings', {
  person: text('person').primaryKey(),
  mode: text('mode').notNull(), // 'direct' | 'routed'
  vendor: text('vendor'),
})

export const payCycles = pgTable('pay_cycles', {
  id: text('id').primaryKey(), // e.g. '2026-07-H1'
  entity: text('entity').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  scheduledPayDate: text('scheduled_pay_date').notNull(),
  status: text('status').notNull(), // 'paid' | 'to_be_paid'
})

export const payCycleLines = pgTable(
  'pay_cycle_lines',
  {
    id: serial('id').primaryKey(),
    cycleId: text('cycle_id').notNull(),
    person: text('person').notNull(),
    minutes: integer('minutes').notNull(),
    rateCents: integer('rate_cents'),
    amountCents: integer('amount_cents'),
    payable: boolean('payable').notNull(),
    excludedReason: text('excluded_reason'),
    deferredFrom: text('deferred_from'),
    originStart: text('origin_start').notNull(),
    originEnd: text('origin_end').notNull(),
    source: text('source').notNull(),
    trace: text('trace').notNull(),
  },
  (t) => [uniqueIndex('pay_cycle_lines_natural_uq').on(t.cycleId, t.person, t.originStart, t.deferredFrom)],
)

export const rulings = pgTable('rulings', {
  id: text('id').primaryKey(), // 'RUL-002'
  kind: text('kind').notNull(), // 'defer' | 'open_ruling' | 'backfill' | 'note'
  label: text('label').notNull(),
  evidence: text('evidence'),
  status: text('status').notNull(), // 'open' | 'decided'
  options: jsonb('options'),
  decidedBy: text('decided_by'),
  decidedAt: timestamp('decided_at'),
})

export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(),
  at: timestamp('at').defaultNow().notNull(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  objectType: text('object_type').notNull(),
  objectId: text('object_id').notNull(),
  detail: text('detail'),
})

/**
 * Counterparties — anyone external that money moves to or from. "Client" is
 * not an entity type here; it's a ROLE in a relationship. One counterparty can
 * hold many relationships across the group: HubSpot is a vendor to The
 * Matchbox AND a commission source; SoundExchange is a royalty source to two
 * entities; Interrupt Media is a vendor and a delivery partner.
 */
export const counterparties = pgTable('counterparties', {
  id: text('id').primaryKey(), // slug, e.g. 'interrupt-media'
  name: text('name').notNull(),
  kind: text('kind').notNull(), // 'org' | 'person'
  notes: text('notes'),
})

export const counterpartyAliases = pgTable('counterparty_aliases', {
  alias: text('alias').primaryKey(), // 'hijenny', 'a4l', 'lytical'
  counterpartyId: text('counterparty_id').notNull(),
})

export const relationships = pgTable('relationships', {
  id: text('id').primaryKey(), // 'celigo:client:the-matchbox'
  counterpartyId: text('counterparty_id').notNull(),
  entity: text('entity').notNull(), // which of OUR entities holds this relationship
  role: text('role').notNull(), // client | customer | vendor | partner | royalty_source | commission_source | tax_agency | other
  streamType: text('stream_type'), // retainer | commission | royalty | one_time | pass_through | saas | services
  effectiveFrom: text('effective_from'),
  effectiveTo: text('effective_to'),
  status: text('status').notNull(), // 'active' | 'ended' | 'prospect'
})
