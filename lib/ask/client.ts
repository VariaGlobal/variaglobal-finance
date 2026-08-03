/**
 * Client for the records brain endpoint.
 *
 * The endpoint ships next. Until it exists we must NOT fake answers — the
 * panel stays in an honest disabled state. Availability is detected, never
 * assumed: we probe the route and treat "route is present" as ready. A route
 * that isn't deployed yet returns 404; once the backend adds the POST handler
 * the probe stops 404-ing and the panel enables itself with no code change.
 */

import type { AskRequest, AskResponse, AskSource, AskSourceType } from '@/lib/ask/types'

const ENDPOINT = '/api/ai/ask'

const VALID_SOURCE_TYPES: AskSourceType[] = [
  'counterparty',
  'cycle',
  'person',
  'transaction',
]

/**
 * Is the brain endpoint deployed? We send a lightweight GET; any response
 * other than 404 means the route exists (e.g. 405 Method Not Allowed for a
 * POST-only handler, or 200 from a health check). Network errors → not ready.
 */
export async function probeAskEndpoint(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, { method: 'GET', signal })
    return res.status !== 404
  } catch {
    return false
  }
}

/** Narrow unknown JSON into well-formed sources, dropping anything invalid. */
function coerceSources(raw: unknown): AskSource[] {
  if (!Array.isArray(raw)) return []
  const out: AskSource[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { type, id, label } = item as Record<string, unknown>
    if (
      typeof type === 'string' &&
      VALID_SOURCE_TYPES.includes(type as AskSourceType) &&
      typeof id === 'string' &&
      typeof label === 'string'
    ) {
      out.push({ type: type as AskSourceType, id, label })
    }
  }
  return out
}

/**
 * Ask the brain a question. Throws on any non-OK response or malformed body —
 * the caller surfaces the error honestly rather than inventing a reply.
 */
export async function askBrain(
  req: AskRequest,
  signal?: AbortSignal,
): Promise<AskResponse> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Ask endpoint responded ${res.status}`)
  }

  const data: unknown = await res.json()
  if (!data || typeof data !== 'object' || typeof (data as { answer?: unknown }).answer !== 'string') {
    throw new Error('Ask endpoint returned an unexpected shape')
  }

  return {
    answer: (data as { answer: string }).answer,
    sources: coerceSources((data as { sources?: unknown }).sources),
  }
}
