import { NextResponse } from 'next/server'
import { getInvoices } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const entity = new URL(req.url).searchParams.get('entity') ?? undefined
    return NextResponse.json({ invoices: await getInvoices(entity) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
