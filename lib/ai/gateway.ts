/**
 * Vercel AI Gateway client — dependency-free (plain fetch against the
 * OpenAI-compatible endpoint) so the pnpm lockfile stays untouched.
 * This file is the ONLY place that knows how models are called.
 * Swap to the AI SDK later without changing any caller.
 *
 * Policy (FINANCE-SYSTEM-ARCHITECTURE.md 5.9): AI suggests, humans decide,
 * engines compute. Nothing in this module writes records.
 */

const GATEWAY_BASE_URL = process.env.AI_GATEWAY_BASE_URL ?? 'https://ai-gateway.vercel.sh/v1'

/** Cheap, fast default for categorization/extraction suggestions. */
export const SUGGEST_MODEL = process.env.AI_SUGGEST_MODEL ?? 'anthropic/claude-haiku-4.5'

export class GatewayError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'GatewayError'
  }
}

export function isGatewayConfigured(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY)
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  text: string
  model: string
  usage?: { promptTokens?: number; completionTokens?: number }
}

export async function chat(opts: {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}): Promise<ChatResult> {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    throw new GatewayError('AI_GATEWAY_API_KEY is not set. Add it to the Vercel project environment.')
  }
  const res = await fetch(`${GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model ?? SUGGEST_MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 1024,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new GatewayError(`Gateway request failed (${res.status}): ${body.slice(0, 300)}`, res.status)
  }
  const data = (await res.json()) as {
    model?: string
    choices?: { message?: { content?: string } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  const text = data.choices?.[0]?.message?.content
  if (typeof text !== 'string') throw new GatewayError('Gateway returned no message content')
  return {
    text,
    model: data.model ?? opts.model ?? SUGGEST_MODEL,
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    },
  }
}

/** Ask for a single strict JSON object and parse it defensively. */
export async function extractJson<T>(opts: {
  model?: string
  system: string
  user: string
}): Promise<{ value: T; model: string }> {
  const { text, model } = await chat({
    model: opts.model,
    messages: [
      {
        role: 'system',
        content: `${opts.system}\nRespond with a single JSON object only. No prose, no code fences.`,
      },
      { role: 'user', content: opts.user },
    ],
  })
  const cleaned = text.trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new GatewayError('Model response contained no JSON object')
  try {
    return { value: JSON.parse(cleaned.slice(start, end + 1)) as T, model }
  } catch {
    throw new GatewayError('Model response was not valid JSON')
  }
}

export async function pingGateway(): Promise<'ok' | 'unauthorized' | 'unreachable'> {
  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) return 'unreachable'
  try {
    const res = await fetch(`${GATEWAY_BASE_URL}/models`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5_000),
    })
    if (res.status === 401 || res.status === 403) return 'unauthorized'
    return res.ok ? 'ok' : 'unreachable'
  } catch {
    return 'unreachable'
  }
}
