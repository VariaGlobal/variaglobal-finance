import { NextResponse } from 'next/server'
import { getDb } from '@/db/client'
import { bootstrapDatabase } from '@/db/seed'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dev/bootstrap?key=<BOOTSTRAP_TOKEN>          - create tables + seed (idempotent)
 * GET /api/dev/bootstrap?key=<BOOTSTRAP_TOKEN>&mode=verify - counts only, no writes
 * Token-gated one-shot; delete this route once live ingestion owns the database.
 */
export async function GET(req: Request) {
  const token = process.env.BOOTSTRAP_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'BOOTSTRAP_TOKEN is not set. Add it in Vercel project env (any value you choose), redeploy, then retry with ?key=<that value>.' },
      { status: 503 },
    )
  }
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== token) {
    return NextResponse.json({ error: 'Invalid or missing key' }, { status: 401 })
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL is not set on this deployment' }, { status: 503 })
  }
  try {
    const mode = url.searchParams.get('mode') === 'verify' ? 'verify' : 'seed'
    const result = await bootstrapDatabase(getDb(), mode)
    return NextResponse.json({ ok: true, mode, ...result })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'bootstrap failed' }, { status: 500 })
  }
}
