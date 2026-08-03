import { NextResponse } from 'next/server'
import { getCycles } from '@/lib/server/records'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ cycles: await getCycles() })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'query failed' }, { status: 500 })
  }
}
