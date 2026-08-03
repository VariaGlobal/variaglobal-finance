'use client'

/**
 * Summary prefetch cache for hover cards. We prefetch live summaries for the
 * ids visible in a hub so hovering renders instantly with real data; if the
 * endpoint is unavailable we serve the bundled fixture summary. Everything
 * resolves synchronously once primed — hover cards never show a spinner.
 */

import type { SummaryResponse, SummaryRowWire, SummaryType } from '@/lib/records-api/types'
import { summaries as fixtureSummaries } from '@/lib/fixtures/records/summaries'
import { summaryUrl } from '@/lib/records-api/resources'

export interface ResolvedSummary {
  type: string
  title: string
  rows: SummaryRowWire[]
  chain?: string
  source: 'live' | 'fallback'
}

const store = new Map<string, ResolvedSummary>()
const inflight = new Map<string, Promise<void>>()

function fixtureKey(recordId: string) {
  return recordId
}

/** Read a resolved summary synchronously. Falls back to the fixture map. */
export function getSummary(recordId: string): ResolvedSummary | undefined {
  if (store.has(recordId)) return store.get(recordId)
  const fx = fixtureSummaries[fixtureKey(recordId)]
  if (fx) {
    return {
      type: fx.type,
      title: fx.title,
      rows: fx.rows,
      chain: fx.chain,
      source: 'fallback',
    }
  }
  return undefined
}

/**
 * Prefetch a batch of summaries for the given (type, id) pairs. Safe to call
 * repeatedly; already-cached and in-flight keys are skipped.
 */
export function prefetchSummaries(pairs: { type: SummaryType; id: string }[]) {
  for (const { type, id } of pairs) {
    if (!id || store.has(id) || inflight.has(id)) continue
    const p = fetch(summaryUrl(type, id), { headers: { accept: 'application/json' } })
      .then(async (res) => {
        const ct = res.headers.get('content-type') ?? ''
        if (!res.ok || !ct.includes('application/json')) throw new Error('unavailable')
        const data = (await res.json()) as SummaryResponse
        const fx = fixtureSummaries[fixtureKey(id)]
        store.set(id, {
          type: fx?.type ?? capitalize(type),
          title: fx?.title ?? id,
          rows: data.rows ?? [],
          chain: fx?.chain,
          source: 'live',
        })
      })
      .catch(() => {
        // leave it to the fixture fallback in getSummary
      })
      .finally(() => {
        inflight.delete(id)
      })
    inflight.set(id, p)
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
