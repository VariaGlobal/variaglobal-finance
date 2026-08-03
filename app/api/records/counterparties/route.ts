import { NextResponse } from 'next/server'
import { getCounterparties } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ counterparties: await getCounterparties() })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
