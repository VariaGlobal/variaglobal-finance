import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db/client'
import * as s from '@/db/schema'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * GET /api/dev/sync-hubspot?key=<BOOTSTRAP_TOKEN>&mode=discover|sync
 * App-side ingestion of Matchbox invoices + payments from HubSpot (Service Key).
 * discover: list available property names for both objects (no writes).
 * sync: upsert invoices + commerce payments into the mirror tables, map
 * counterparties via the alias registry, log to sync_runs. Read-only upstream.
 */

const HS_BASE = 'https://api.hubapi.com'

async function hs(path: string, params: Record<string, string>) {
  const url = new URL(HS_BASE + path)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.HUBSPOT_TOKEN_MATCHBOX}` },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HubSpot ${path} ${res.status}: ${(await res.text()).slice(0, 180)}`)
  return res.json() as Promise<{ results: { name?: string; id?: string; properties?: Record<string, string | null> }[]; paging?: { next?: { after?: string } } }>
}

async function propertyNames(objectType: string): Promise<Set<string>> {
  const data = await hs(`/crm/v3/properties/${objectType}`, {})
  return new Set(data.results.map((p) => p.name as string))
}

async function fetchAll(objectType: string, props: string[]): Promise<{ id: string; properties: Record<string, string | null> }[]> {
  const out: { id: string; properties: Record<string, string | null> }[] = []
  let after: string | undefined
  for (let page = 0; page < 40; page++) {
    const params: Record<string, string> = { limit: '100', properties: props.join(','), archived: 'false' }
    if (after) params.after = after
    const data = await hs(`/crm/v3/objects/${objectType}`, params)
    out.push(...(data.results as { id: string; properties: Record<string, string | null> }[]))
    after = data.paging?.next?.after
    if (!after) break
  }
  return out
}

const cents = (v: string | null | undefined) => (v === null || v === undefined || v === '' ? null : Math.round(parseFloat(v) * 100))

export async function GET(req: Request) {
  const token = process.env.BOOTSTRAP_TOKEN
  const url = new URL(req.url)
  if (!token || url.searchParams.get('key') !== token) return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
  if (!process.env.HUBSPOT_TOKEN_MATCHBOX) return NextResponse.json({ error: 'HUBSPOT_TOKEN_MATCHBOX not set' }, { status: 503 })

  try {
    const [invProps, payProps] = await Promise.all([propertyNames('invoices'), propertyNames('commerce_payments')])
    if (url.searchParams.get('mode') === 'discover') {
      return NextResponse.json({ invoices: [...invProps].sort(), commerce_payments: [...payProps].sort() })
    }

    const db = getDb()
    const [cps, aliases] = await Promise.all([db.select().from(s.counterparties), db.select().from(s.counterpartyAliases)])
    const needles: { needle: string; id: string }[] = []
    for (const c of cps) needles.push({ needle: c.name.toLowerCase(), id: c.id })
    for (const a of aliases) needles.push({ needle: a.alias.toLowerCase(), id: a.counterpartyId })
    const matchCp = (rawName: string | null | undefined): string | null => {
      if (!rawName) return null
      const n = rawName.toLowerCase()
      let best: { id: string; len: number } | null = null
      for (const { needle, id } of needles) {
        if (needle.length >= 3 && (n.includes(needle) || needle.includes(n))) {
          if (!best || needle.length > best.len) best = { id, len: needle.length }
        }
      }
      return best ? best.id : null
    }

    const wantInv = ['hs_invoice_number', 'hs_number', 'hs_invoice_status', 'hs_status', 'hs_amount_billed', 'hs_balance_due', 'hs_currency', 'hs_invoice_date', 'hs_due_date', 'hs_recipient_company', 'hs_sender_company_name', 'hs_lastmodifieddate'].filter((p) => invProps.has(p))
    const invoices = await fetchAll('invoices', wantInv)
    let invUpserts = 0
    for (const inv of invoices) {
      const p = inv.properties
      const rawName = p.hs_recipient_company ?? null
      await db
        .insert(s.invoices)
        .values({
          hsId: inv.id,
          number: p.hs_invoice_number ?? p.hs_number ?? null,
          status: p.hs_invoice_status ?? p.hs_status ?? null,
          counterpartyId: matchCp(rawName),
          counterpartyRaw: rawName,
          amountBilledCents: cents(p.hs_amount_billed),
          balanceDueCents: cents(p.hs_balance_due),
          currency: p.hs_currency ?? 'USD',
          invoiceDate: (p.hs_invoice_date ?? '').slice(0, 10) || null,
          dueDate: (p.hs_due_date ?? '').slice(0, 10) || null,
          raw: p,
        })
        .onConflictDoUpdate({
          target: s.invoices.hsId,
          set: { status: p.hs_invoice_status ?? p.hs_status ?? null, balanceDueCents: cents(p.hs_balance_due), raw: p, syncedAt: new Date() },
        })
      invUpserts++
    }

    const wantPay = ['hs_customer_name', 'hs_initial_amount', 'hs_fees_amount', 'hs_platform_fee', 'hs_net_amount', 'hs_payout_date', 'hs_latest_status', 'hs_payment_date', 'hs_createdate'].filter((p) => payProps.has(p))
    const payments = await fetchAll('commerce_payments', wantPay)
    let payUpserts = 0
    for (const pm of payments) {
      const p = pm.properties
      await db
        .insert(s.invoicePayments)
        .values({
          hsId: pm.id,
          customerRaw: p.hs_customer_name ?? null,
          counterpartyId: matchCp(p.hs_customer_name),
          grossCents: cents(p.hs_initial_amount),
          feesCents: cents(p.hs_fees_amount ?? p.hs_platform_fee),
          netCents: cents(p.hs_net_amount),
          payoutDate: (p.hs_payout_date ?? '').slice(0, 10) || null,
          paymentDate: (p.hs_payment_date ?? p.hs_createdate ?? '').slice(0, 10) || null,
          status: p.hs_latest_status ?? null,
          raw: p,
        })
        .onConflictDoUpdate({
          target: s.invoicePayments.hsId,
          set: { status: p.hs_latest_status ?? null, payoutDate: (p.hs_payout_date ?? '').slice(0, 10) || null, raw: p, syncedAt: new Date() },
        })
      payUpserts++
    }

    await db.execute(sql`INSERT INTO sync_runs (source, window_start, window_end, finished_at, status, inserted, notes)
      VALUES ('hubspot:the-matchbox', 'all', 'all', now(), 'ok', ${invUpserts + payUpserts}, ${'invoices ' + invUpserts + ', payments ' + payUpserts + '; app-side sync via Service Key'})`)

    const unmatched = [...new Set(invoices.filter((i) => !matchCp(i.properties.hs_recipient_company)).map((i) => i.properties.hs_recipient_company).filter(Boolean))]
    return NextResponse.json({ ok: true, invoices: invUpserts, payments: payUpserts, propertiesUsed: { invoices: wantInv, payments: wantPay }, unmatchedCounterparties: unmatched.slice(0, 20) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'sync failed' }, { status: 500 })
  }
}
