/**
 * Database bootstrap — DDL (idempotent) + seed from the cell-verified fixtures.
 * Called only by the token-gated /api/dev/bootstrap route. Safe to re-run:
 * creates missing tables, upserts reference data, replaces cycle lines with
 * identical engine output. Retired once live ingestion owns the database.
 */

import { sql } from 'drizzle-orm'
import { eq } from 'drizzle-orm'
import type { Db } from '@/db/client'
import * as s from '@/db/schema'
import { engineContext, realCycleSpecs } from '@/lib/fixtures/real-cycles'
import { runPayroll } from '@/lib/engine/payroll'

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS people (id text PRIMARY KEY, name text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS rate_cards (id serial PRIMARY KEY, person text NOT NULL, month text NOT NULL, rate_cents integer NOT NULL, source text NOT NULL, created_at timestamp DEFAULT now() NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS rate_cards_person_month_rate_uq ON rate_cards (person, month, rate_cents)`,
  `CREATE TABLE IF NOT EXISTS payee_routings (person text PRIMARY KEY, mode text NOT NULL, vendor text)`,
  `CREATE TABLE IF NOT EXISTS pay_cycles (id text PRIMARY KEY, entity text NOT NULL, period_start text NOT NULL, period_end text NOT NULL, scheduled_pay_date text NOT NULL, status text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS pay_cycle_lines (id serial PRIMARY KEY, cycle_id text NOT NULL, person text NOT NULL, minutes integer NOT NULL, rate_cents integer, amount_cents integer, payable boolean NOT NULL, excluded_reason text, deferred_from text, origin_start text NOT NULL, origin_end text NOT NULL, source text NOT NULL, trace text NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS pay_cycle_lines_natural_uq ON pay_cycle_lines (cycle_id, person, origin_start, deferred_from)`,
  `CREATE TABLE IF NOT EXISTS rulings (id text PRIMARY KEY, kind text NOT NULL, label text NOT NULL, evidence text, status text NOT NULL, options jsonb, decision text, decided_by text, decided_at timestamp)`,
  `ALTER TABLE rulings ADD COLUMN IF NOT EXISTS decision text`,
  `CREATE TABLE IF NOT EXISTS audit_events (id serial PRIMARY KEY, at timestamp DEFAULT now() NOT NULL, actor text NOT NULL, action text NOT NULL, object_type text NOT NULL, object_id text NOT NULL, detail text)`,
  `CREATE TABLE IF NOT EXISTS counterparties (id text PRIMARY KEY, name text NOT NULL, kind text NOT NULL, notes text)`,
  `CREATE TABLE IF NOT EXISTS counterparty_aliases (alias text PRIMARY KEY, counterparty_id text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS relationships (id text PRIMARY KEY, counterparty_id text NOT NULL, entity text NOT NULL, role text NOT NULL, stream_type text, effective_from text, effective_to text, status text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS relationship_roles (id text PRIMARY KEY, label text NOT NULL, money_direction text NOT NULL, counts_as_revenue boolean NOT NULL DEFAULT false, is_payable boolean NOT NULL DEFAULT false, requires_contract boolean NOT NULL DEFAULT false, description text, active boolean NOT NULL DEFAULT true)`,
  `CREATE TABLE IF NOT EXISTS stream_types (id text PRIMARY KEY, label text NOT NULL, active boolean NOT NULL DEFAULT true)`,
  `CREATE TABLE IF NOT EXISTS expense_categories (id text PRIMARY KEY, label text NOT NULL, active boolean NOT NULL DEFAULT true)`,
  `CREATE TABLE IF NOT EXISTS time_entries (asana_gid text PRIMARY KEY, person text NOT NULL, entered_on text NOT NULL, minutes integer NOT NULL, task_gid text, task_name text, project_gid text, project_name text, billable_status text, approval_status text, created_at text, source text NOT NULL DEFAULT 'asana', synced_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS bank_transactions (mercury_id text PRIMARY KEY, entity text NOT NULL, account_id text, amount_cents integer NOT NULL, counterparty_name text, bank_description text, external_memo text, kind text, status text NOT NULL, created_at text, posted_at text, gl_code text, source text NOT NULL DEFAULT 'mercury', synced_at timestamp NOT NULL DEFAULT now())`,
  `CREATE TABLE IF NOT EXISTS sync_runs (id serial PRIMARY KEY, source text NOT NULL, window_start text, window_end text, started_at timestamp NOT NULL DEFAULT now(), finished_at timestamp, status text NOT NULL, inserted integer DEFAULT 0, updated integer DEFAULT 0, upstream_changes integer DEFAULT 0, error_detail text, notes text)`,
  `CREATE TABLE IF NOT EXISTS transaction_categorizations (id serial PRIMARY KEY, mercury_id text NOT NULL, counterparty_id text, category text NOT NULL, note text, tagged_by text NOT NULL, tagged_at timestamp NOT NULL DEFAULT now(), superseded_by integer)`,
  `CREATE INDEX IF NOT EXISTS txn_cat_mercury_idx ON transaction_categorizations (mercury_id)`,
]

const slugify = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Counterparty registry — from the ecosystem docs + finance workbooks. A role, not a type. */
const COUNTERPARTIES: { id: string; name: string; kind: 'org' | 'person'; notes?: string }[] = [
  { id: 'ecommission', name: 'eCommission', kind: 'org' },
  { id: 'celigo', name: 'Celigo', kind: 'org' },
  { id: 'maxwell-social', name: 'Maxwell Social', kind: 'org' },
  { id: 'tmrw-for-men', name: 'TMRW for Men', kind: 'org' },
  { id: 'lytical-ventures', name: 'Lytical Ventures', kind: 'org', notes: 'Often confused with Lyrical Asset Management in transcripts' },
  { id: 'lyrical-asset-management', name: 'Lyrical Asset Management', kind: 'org', notes: 'Billed only if combined Lytical+Lyrical hours exceed 20h' },
  { id: 'animated-for-life', name: 'Animated for Life', kind: 'org' },
  { id: 'montycloud', name: 'MontyCloud', kind: 'org' },
  { id: 'peoplefinders', name: 'PeopleFinders', kind: 'org', notes: 'Sub-brands: LeadSherpa, PropertyReach; co-delivered with Interrupt Media' },
  { id: 'rebld-ai', name: 'Rebld.ai', kind: 'org', notes: 'Subsidiary: HiJenny' },
  { id: 'pineapple-family', name: 'Pineapple Family', kind: 'org' },
  { id: 'brass-animals', name: 'Brass Animals', kind: 'org', notes: 'Owned by Ben Lack (also owns Interrupt Media)' },
  { id: 'evoke-agency', name: 'Evoke Agency', kind: 'org' },
  { id: 'deodato', name: 'Deodato', kind: 'org' },
  { id: 'ooni', name: 'Ooni', kind: 'org' },
  { id: 'interrupt-media', name: 'Interrupt Media', kind: 'org', notes: 'Ben Lack. External partner — NOT a Varia entity. Pass-through payee for routed contractors' },
  { id: 'jd-tech-llc', name: 'JD Tech LLC', kind: 'org', notes: 'John DeStefano. Software billed in advance, services in arrears' },
  { id: 'zacharin-consulting', name: 'Zacharin Consulting', kind: 'org', notes: 'Bookkeeping (Lauraine); operates Gusto payroll' },
  { id: 'rainwater-cpa', name: 'Rainwater CPA', kind: 'org' },
  { id: 'hubspot', name: 'HubSpot', kind: 'org', notes: 'Both a vendor (SaaS + payments processing) and a commission source' },
  { id: 'soundexchange', name: 'SoundExchange', kind: 'org' },
  { id: 'bmi', name: 'BMI', kind: 'org' },
  { id: 'the-mlc', name: 'The MLC', kind: 'org' },
  { id: 'symphonic', name: 'Symphonic', kind: 'org' },
]

const ALIASES: { alias: string; counterpartyId: string }[] = [
  { alias: 'im', counterpartyId: 'interrupt-media' },
  { alias: 'a4l', counterpartyId: 'animated-for-life' },
  { alias: 'hijenny', counterpartyId: 'rebld-ai' },
  { alias: 'lytical', counterpartyId: 'lytical-ventures' },
  { alias: 'lyrical', counterpartyId: 'lyrical-asset-management' },
  { alias: 'tmrw', counterpartyId: 'tmrw-for-men' },
  { alias: 'pf', counterpartyId: 'peoplefinders' },
  { alias: 'john-destefano', counterpartyId: 'jd-tech-llc' },
]

const REL = (counterpartyId: string, entity: string, role: string, streamType: string | null, status: string): typeof s.relationships.$inferInsert => ({
  id: `${counterpartyId}:${role}:${entity}`,
  counterpartyId,
  entity,
  role,
  streamType,
  effectiveFrom: null,
  effectiveTo: null,
  status,
})

const RELATIONSHIPS: (typeof s.relationships.$inferInsert)[] = [
  REL('ecommission', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('celigo', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('maxwell-social', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('tmrw-for-men', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('lytical-ventures', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('lyrical-asset-management', 'the-matchbox', 'client', 'retainer', 'active'),
  REL('animated-for-life', 'the-matchbox', 'client', 'services', 'active'),
  REL('montycloud', 'the-matchbox', 'client', 'retainer', 'ended'),
  REL('peoplefinders', 'the-matchbox', 'client', 'retainer', 'ended'),
  REL('rebld-ai', 'the-matchbox', 'client', 'retainer', 'ended'),
  REL('pineapple-family', 'the-matchbox', 'client', null, 'active'),
  REL('brass-animals', 'the-ad-spend', 'customer', 'saas', 'active'),
  REL('evoke-agency', 'the-ad-spend', 'customer', 'saas', 'active'),
  REL('deodato', 'the-ad-spend', 'customer', 'saas', 'active'),
  REL('ooni', 'the-ad-spend', 'customer', 'saas', 'active'),
  REL('interrupt-media', 'the-matchbox', 'vendor', 'pass_through', 'active'),
  REL('interrupt-media', 'the-matchbox', 'partner', 'services', 'active'),
  REL('jd-tech-llc', 'the-matchbox', 'vendor', 'services', 'active'),
  REL('zacharin-consulting', 'varia-global', 'vendor', 'services', 'active'),
  REL('rainwater-cpa', 'varia-global', 'vendor', 'services', 'active'),
  REL('hubspot', 'the-matchbox', 'vendor', 'saas', 'active'),
  REL('hubspot', 'the-matchbox', 'commission_source', 'commission', 'active'),
  REL('soundexchange', 'spyll-world', 'royalty_source', 'royalty', 'active'),
  REL('soundexchange', 'bisaria-publishing', 'royalty_source', 'royalty', 'active'),
  REL('bmi', 'bisaria-publishing', 'royalty_source', 'royalty', 'active'),
  REL('the-mlc', 'bisaria-publishing', 'royalty_source', 'royalty', 'active'),
  REL('symphonic', 'spyll-world', 'royalty_source', 'royalty', 'active'),
]

export interface BootstrapResult {
  counts: Record<string, number>
  juneDbPayableCents: number
  juneMatchesEngine: boolean
}

export async function bootstrapDatabase(db: Db, mode: 'seed' | 'verify' = 'seed'): Promise<BootstrapResult> {
  if (mode === 'seed') {
    for (const stmt of DDL) await db.execute(sql.raw(stmt))

    const persons = Array.from(new Set(engineContext.rates.map((r) => r.person)))
    await db.insert(s.people).values(persons.map((n) => ({ id: slugify(n), name: n }))).onConflictDoNothing()
    await db
      .insert(s.rateCards)
      .values(engineContext.rates.map((r) => ({ person: r.person, month: r.month, rateCents: r.rateCentsPerHour, source: r.source })))
      .onConflictDoNothing()
    await db
      .insert(s.payeeRoutings)
      .values(engineContext.routings.map((r) => ({ person: r.person, mode: r.mode, vendor: r.vendor ?? null })))
      .onConflictDoNothing()

    const results = runPayroll(realCycleSpecs, engineContext)
    for (const spec of realCycleSpecs) {
      await db
        .insert(s.payCycles)
        .values({ id: spec.id, entity: spec.entity, periodStart: spec.periodStart, periodEnd: spec.periodEnd, scheduledPayDate: spec.scheduledPayDate, status: spec.status })
        .onConflictDoNothing()
    }
    for (const c of results) {
      await db.delete(s.payCycleLines).where(eq(s.payCycleLines.cycleId, c.cycleId))
      await db.insert(s.payCycleLines).values(
        c.lines.map((l) => ({
          cycleId: c.cycleId,
          person: l.person,
          minutes: l.minutes,
          rateCents: l.rateCentsPerHour,
          amountCents: l.amountCents,
          payable: l.payable,
          excludedReason: l.excludedReason ?? null,
          deferredFrom: l.deferredIn ? l.deferredIn.fromCycleId : null,
          originStart: l.originPeriod.slice(0, 10),
          originEnd: l.originPeriod.slice(-10),
          source: 'extraction 2026-07-27 (cell-verified)',
          trace: l.trace,
        })),
      )
    }

    const rulingRows = [
      { id: 'RUL-001', kind: 'defer', label: 'Arsalan June 16-30 $5,150 deferred to Jul 31 (not paid Jul 15)', evidence: 'Mercury txn 9f1d882e-8217-11f1-a4d1-a34b61ec221a: only $600 to Syed Arsalan Raza in Jul 10-27 window', status: 'decided', options: null, decidedBy: 'Ani Bisaria' },
      { id: 'RUL-002', kind: 'open_ruling', label: 'Apply "subtract 3 hours paid directly to IM"?', evidence: 'Sheet notes June F4 / July F13 - never applied by any formula', status: 'decided', options: [{ label: 'Pay full $5,150.00', amountCents: 515000 }, { label: 'Apply -3h via IM $4,850.00', amountCents: 485000 }], decision: 'Apply -3h via IM: $4,850.00 direct in 2026-07-H1; $300.00 settles via the latest Interrupt Media invoice. One-off - Arsalan no longer logs time with IM.', decidedBy: 'Sydney Allen (Slack, relayed by Ani Bisaria)' },
      { id: 'RUL-003', kind: 'backfill', label: 'Zach Crew $15/h - cycle tab only, absent from Rate Card', evidence: 'June tab row 14', status: 'decided', options: null, decidedBy: 'Ani Bisaria' },
      { id: 'RUL-004', kind: 'backfill', label: 'Abdullah/Kayla/Miles June rates backfilled from 2026-07 card', evidence: 'Rate Card 2026-06 gaps', status: 'decided', options: null, decidedBy: 'Ani Bisaria' },
    ]
    for (const r of rulingRows) await db.insert(s.rulings).values(r).onConflictDoNothing()

    const ROLE_ROWS: (typeof s.relationshipRoles.$inferInsert)[] = [
      { id: 'client', label: 'Client', moneyDirection: 'in', countsAsRevenue: true, requiresContract: true, description: 'Pays one of our entities for services under contract' },
      { id: 'customer', label: 'Customer', moneyDirection: 'in', countsAsRevenue: true, requiresContract: true, description: 'Pays for a product/SaaS (e.g. The Ad Spend platform)' },
      { id: 'vendor', label: 'Vendor', moneyDirection: 'out', isPayable: true, description: 'We pay them for goods/services' },
      { id: 'partner', label: 'Partner', moneyDirection: 'both', description: 'Co-delivery / strategic; money can flow either way' },
      { id: 'royalty_source', label: 'Royalty source', moneyDirection: 'in', countsAsRevenue: true, description: 'Pays royalties/distributions (SoundExchange, BMI...)' },
      { id: 'commission_source', label: 'Commission source', moneyDirection: 'in', countsAsRevenue: true, description: 'Pays commissions on deals (HubSpot partner program)' },
      { id: 'tax_agency', label: 'Tax agency', moneyDirection: 'out', isPayable: true, description: 'IRS, state agencies' },
      { id: 'owner', label: 'Owner', moneyDirection: 'out', description: 'Owner/shareholder - draws, contributions, reimbursements. Operational label only; tax classification belongs to the accountants.' },
      { id: 'artist', label: 'Artist', moneyDirection: 'out', isPayable: true, requiresContract: true, description: 'We pay them royalties/advances as a performing or recording artist' },
    ]
    for (const r of ROLE_ROWS) await db.insert(s.relationshipRoles).values(r).onConflictDoNothing()
    for (const st of [['retainer','Retainer'],['saas','SaaS subscription'],['services','Services'],['commission','Commission'],['royalty','Royalty'],['pass_through','Pass-through'],['one_time','One-time project']]) {
      await db.insert(s.streamTypes).values({ id: st[0], label: st[1] }).onConflictDoNothing()
    }
    for (const c of ['software_subscription','contractor_cost','vendor_pass_through','ad_spend','travel','meals','banking_fees','intercompany','client_reimbursable','legal_professional','other']) {
      await db.insert(s.expenseCategories).values({ id: c, label: c.replace(/_/g, ' ').replace(/^./, (ch) => ch.toUpperCase()) }).onConflictDoNothing()
    }
    await db.insert(s.expenseCategories).values({ id: 'owner_draw', label: 'Owner draw / distribution (operational label, not tax advice)' }).onConflictDoNothing()
    await db.insert(s.expenseCategories).values({ id: 'artist_royalty_payout', label: 'Artist royalty payout' }).onConflictDoNothing()
    await db.insert(s.counterparties).values({ id: 'ani-bisaria', name: 'Aniruddh Bisaria', kind: 'person', notes: 'Founder/owner across all entities. Transfers to personal Fidelity cash account (auto-invested).' }).onConflictDoNothing()
    await db.insert(s.relationships).values({ id: 'ani-bisaria:owner:the-matchbox', counterpartyId: 'ani-bisaria', entity: 'the-matchbox', role: 'owner', streamType: null, effectiveFrom: null, effectiveTo: null, status: 'active' }).onConflictDoNothing()
    await db.insert(s.relationships).values({ id: 'ani-bisaria:artist:spyll-world', counterpartyId: 'ani-bisaria', entity: 'spyll-world', role: 'artist', streamType: 'royalty', effectiveFrom: null, effectiveTo: null, status: 'active' }).onConflictDoNothing()

    await db.insert(s.counterparties).values(COUNTERPARTIES).onConflictDoNothing()
    await db.insert(s.counterpartyAliases).values(ALIASES).onConflictDoNothing()
    await db.insert(s.relationships).values(RELATIONSHIPS).onConflictDoNothing()

    const seededBefore = await db.select().from(s.auditEvents)
    if (!seededBefore.some((e) => e.action === 'seeded counterparty registry')) {
      await db.insert(s.auditEvents).values({
        actor: 'claude (bootstrap)',
        action: 'seeded counterparty registry',
        objectType: 'database',
        objectId: 'neon',
        detail: `${COUNTERPARTIES.length} counterparties, ${RELATIONSHIPS.length} relationships, ${ALIASES.length} aliases - roles not types: client/customer/vendor/partner/royalty_source/commission_source`,
      })
    }
    if (!seededBefore.some((e) => e.action === 'seeded phase-1 core')) {
      await db.insert(s.auditEvents).values({
        actor: 'claude (bootstrap)',
        action: 'seeded phase-1 core',
        objectType: 'database',
        objectId: 'neon',
        detail: 'people, rate_cards, routings, cycles 2026-06-H2 + 2026-07-H1 with lines, rulings RUL-001..004 - from cell-verified extraction',
      })
    }
  }

  const counts: Record<string, number> = {}
  counts.people = (await db.select().from(s.people)).length
  counts.rate_cards = (await db.select().from(s.rateCards)).length
  counts.payee_routings = (await db.select().from(s.payeeRoutings)).length
  counts.pay_cycles = (await db.select().from(s.payCycles)).length
  counts.pay_cycle_lines = (await db.select().from(s.payCycleLines)).length
  counts.rulings = (await db.select().from(s.rulings)).length
  counts.counterparties = (await db.select().from(s.counterparties)).length
  counts.relationships = (await db.select().from(s.relationships)).length
  counts.counterparty_aliases = (await db.select().from(s.counterpartyAliases)).length
  counts.audit_events = (await db.select().from(s.auditEvents)).length
  counts.relationship_roles = (await db.select().from(s.relationshipRoles)).length
  counts.time_entries = (await db.select().from(s.timeEntries)).length
  counts.bank_transactions = (await db.select().from(s.bankTransactions)).length
  counts.sync_runs = (await db.select().from(s.syncRuns)).length
  counts.transaction_categorizations = (await db.select().from(s.transactionCategorizations)).length

  const juneLines = await db.select().from(s.payCycleLines).where(eq(s.payCycleLines.cycleId, '2026-06-H2'))
  const juneDbPayableCents = juneLines.filter((l) => l.payable).reduce((a, l) => a + (l.amountCents ?? 0), 0)
  return { counts, juneDbPayableCents, juneMatchesEngine: juneDbPayableCents === 1134492 }
}
