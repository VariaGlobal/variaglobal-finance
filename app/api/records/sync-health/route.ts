import { NextResponse } from 'next/server'
import { getSyncHealth } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ sources: await getSyncHealth() })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
