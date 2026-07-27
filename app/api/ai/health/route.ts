import { NextResponse } from 'next/server'
import { isGatewayConfigured, pingGateway, SUGGEST_MODEL } from '@/lib/ai/gateway'

export const dynamic = 'force-dynamic'

/** GET /api/ai/health — verify AI Gateway wiring from the browser. */
export async function GET() {
  const configured = isGatewayConfigured()
  const gateway = configured ? await pingGateway() : 'not_configured'
  return NextResponse.json({ configured, gateway, suggestModel: SUGGEST_MODEL })
}
