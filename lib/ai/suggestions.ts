/**
 * Suggestion envelope — the accountability wrapper around every AI output.
 * In the database phase this becomes the ai_suggestions table; the shape
 * and the API contract stay the same. Nothing here writes records:
 * a suggestion becomes a fact only when a human accepts it, and that
 * acceptance is recorded (decidedBy, decidedAt).
 */

import type { AiSuggestion } from '@/lib/types'

export type SuggestionKind =
  | 'categorize_expense'
  | 'match_candidate'
  | 'extract_terms'
  | 'anomaly_note'

export type SuggestionStatus = 'pending' | 'accepted' | 'rejected'

export interface SuggestionRecord<TPayload = unknown> {
  id: string
  kind: SuggestionKind
  /** The record this suggestion is about, e.g. { type: "expense_line", id: "amex_2026_07_l14" } */
  objectRef: { type: string; id: string }
  payload: TPayload
  summary: string
  /** Provenance: "ai:categorize" or "rule:prior-mapping" (deterministic, no model). */
  source: string
  model: string
  confidence: number
  status: SuggestionStatus
  createdAt: string
  decidedBy?: string
  decidedAt?: string
}

export function makeSuggestion<T>(
  input: Omit<SuggestionRecord<T>, 'id' | 'status' | 'createdAt'>,
): SuggestionRecord<T> {
  return {
    ...input,
    id: `sug_${crypto.randomUUID()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

/** Map a server-side record to the UI type v0 components already render. */
export function toUiSuggestion(record: SuggestionRecord): AiSuggestion {
  const confidence = Math.max(0, Math.min(100, Math.round(record.confidence)))
  return {
    id: record.id,
    confidence,
    confidenceDisplay: `${confidence}%`,
    summary: record.summary,
    source: record.source,
  }
}
