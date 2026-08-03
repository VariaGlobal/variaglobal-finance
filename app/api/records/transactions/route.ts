import { NextResponse } from 'next/server'
import { getTransactions } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const entity = url.searchParams.get('entity') ?? undefined
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 500)
    return NextResponse.json({ transactions: await getTransactions(entity, limit) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
