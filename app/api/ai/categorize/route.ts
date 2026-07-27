import { NextResponse } from 'next/server'
import { GatewayError, extractJson, isGatewayConfigured } from '@/lib/ai/gateway'
import { makeSuggestion, toUiSuggestion } from '@/lib/ai/suggestions'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  'software_subscription',
  'contractor_cost',
  'vendor_pass_through',
  'ad_spend',
  'travel',
  'meals',
  'banking_fees',
  'intercompany',
  'client_reimbursable',
  'legal_professional',
  'other',
] as const

type Category = (typeof CATEGORIES)[number]

interface CategorizeBody {
  description: string
  counterparty?: string
  amountDisplay?: string
  objectRef?: { type: string; id: string }
  /** Previously human-accepted mappings; matched deterministically before any model call. */
  priorMappings?: { pattern: string; category: Category }[]
}

interface ModelAnswer {
  category: Category
  confidence: number
  rationale: string
}

/**
 * POST /api/ai/categorize — suggest a category for one expense/bank line.
 * Suggest-only: returns a pending SuggestionRecord; writes nothing.
 * Deterministic rule first, model second (math before AI).
 */
export async function POST(req: Request) {
  let body: CategorizeBody
  try {
    body = (await req.json()) as CategorizeBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.description || !body.description.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 })
  }
  const objectRef = body.objectRef ?? { type: 'expense_line', id: 'unassigned' }

  const prior = (body.priorMappings ?? []).find((m) =>
    body.description.toLowerCase().includes(m.pattern.toLowerCase()),
  )
  if (prior) {
    const record = makeSuggestion({
      kind: 'categorize_expense',
      objectRef,
      payload: { category: prior.category, rationale: `Matches accepted mapping: ${prior.pattern}` },
      summary: `${prior.category} — prior accepted mapping`,
      source: 'rule:prior-mapping',
      model: 'none',
      confidence: 100,
    })
    return NextResponse.json({ suggestion: record, ui: toUiSuggestion(record) })
  }

  if (!isGatewayConfigured()) {
    return NextResponse.json(
      { error: 'AI Gateway not configured. Set AI_GATEWAY_API_KEY in the Vercel project.' },
      { status: 503 },
    )
  }

  try {
    const { value, model } = await extractJson<ModelAnswer>({
      system:
        'You categorize a single business expense line for a marketing agency group ' +
        '(The Matchbox, Varia Global, Spyll World, The Ad Spend). ' +
        `Allowed categories: ${CATEGORIES.join(', ')}. ` +
        'Return JSON: {"category": string, "confidence": number 0-100, "rationale": short string}. ' +
        'You only suggest; a human will accept or reject.',
      user: JSON.stringify({
        description: body.description,
        counterparty: body.counterparty,
        amount: body.amountDisplay,
      }),
    })
    const valid = CATEGORIES.includes(value.category)
    const record = makeSuggestion({
      kind: 'categorize_expense',
      objectRef,
      payload: { category: valid ? value.category : 'other', rationale: value.rationale },
      summary: `${valid ? value.category : 'other'} — ${value.rationale}`.slice(0, 140),
      source: 'ai:categorize',
      model,
      confidence: valid ? Math.max(0, Math.min(100, value.confidence)) : 25,
    })
    return NextResponse.json({ suggestion: record, ui: toUiSuggestion(record) })
  } catch (err) {
    const status = err instanceof GatewayError ? 502 : 500
    const message = err instanceof Error ? err.message : 'Categorization failed'
    return NextResponse.json({ error: message }, { status })
  }
}
