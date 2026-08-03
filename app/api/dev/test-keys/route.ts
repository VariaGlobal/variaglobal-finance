import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/test-keys?key=<BOOTSTRAP_TOKEN>
 * Read-only probe of every integration credential in env. Each test is a
 * single harmless GET; nothing is written anywhere. This is the backend for
 * the Settings "test connection" buttons, and how we verify Sensitive env
 * vars that can never be read back out of Vercel.
 */

interface KeyReport {
  env: string
  present: boolean
  test?: string
  detail?: string
}

async function probe(name: string, fn: () => Promise<Response>): Promise<KeyReport> {
  if (!process.env[name]) return { env: name, present: false }
  try {
    const res = await fn()
    return {
      env: name,
      present: true,
      test: res.ok ? 'ok' : `http ${res.status}`,
      detail: res.ok ? undefined : (await res.text()).slice(0, 140),
    }
  } catch (err) {
    return { env: name, present: true, test: 'error', detail: err instanceof Error ? err.message.slice(0, 140) : 'failed' }
  }
}

export async function GET(req: Request) {
  const token = process.env.BOOTSTRAP_TOKEN
  if (!token || new URL(req.url).searchParams.get('key') !== token) {
    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 401 })
  }
  const t = (ms: number) => AbortSignal.timeout(ms)
  const reports = await Promise.all([
    probe('HUBSPOT_TOKEN_MATCHBOX', () =>
      fetch('https://api.hubapi.com/crm/v3/objects/invoices?limit=1', {
        headers: { authorization: `Bearer ${process.env.HUBSPOT_TOKEN_MATCHBOX}` },
        signal: t(8000),
      }),
    ),
    probe('STRIPE_KEY_ADSPEND', () =>
      fetch('https://api.stripe.com/v1/invoices?limit=1', {
        headers: { authorization: `Bearer ${process.env.STRIPE_KEY_ADSPEND}` },
        signal: t(8000),
      }),
    ),
    probe('BREX_TOKEN_ADSPEND', () =>
      fetch('https://platform.brexapis.com/v2/accounts/cash', {
        headers: { authorization: `Bearer ${process.env.BREX_TOKEN_ADSPEND}` },
        signal: t(8000),
      }),
    ),
    probe('MERCURY_TOKEN_MATCHBOX', () =>
      fetch('https://api.mercury.com/api/v1/accounts', {
        headers: { authorization: `Bearer ${process.env.MERCURY_TOKEN_MATCHBOX}` },
        signal: t(8000),
      }),
    ),
    probe('MERCURY_TOKEN_SPYLL', () =>
      fetch('https://api.mercury.com/api/v1/accounts', {
        headers: { authorization: `Bearer ${process.env.MERCURY_TOKEN_SPYLL}` },
        signal: t(8000),
      }),
    ),
    probe('ASANA_PAT', () =>
      fetch('https://app.asana.com/api/1.0/users/me', {
        headers: { authorization: `Bearer ${process.env.ASANA_PAT}` },
        signal: t(8000),
      }),
    ),
  ])
  const summary = reports.map((r) => `${r.env}: ${!r.present ? 'not set' : r.test}`).join(' · ')
  return NextResponse.json({
    summary,
    reports,
    note: 'All probes are read-only single-record requests. "not set" means the env var is missing — add it and redeploy.',
  })
}
