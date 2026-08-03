import { NextResponse } from 'next/server'
import { getSummary } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type') ?? ''
    const id = url.searchParams.get('id') ?? ''
    if (!type || !id) return NextResponse.json({ error: 'type and id are required' }, { status: 400 })
    return NextResponse.json({ rows: await getSummary(type, id) })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
