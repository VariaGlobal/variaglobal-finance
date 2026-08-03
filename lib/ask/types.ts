/**
 * Ask panel — a chat scoped to OUR records, not a generic assistant.
 *
 * The backend contract (ships next) is deliberately narrow:
 *   POST /api/ai/ask  { question, history: [{ role, content }] }
 *     → { answer, sources: [{ type, id, label }] }
 *
 * Every answer about our data must carry the records it drew from, so the
 * source chip type mirrors the record kinds the panel can navigate to.
 */

export type AskRole = 'user' | 'assistant'

/** A record the assistant cited — clicking it navigates into Records. */
export type AskSourceType = 'counterparty' | 'cycle' | 'person' | 'transaction'

export interface AskSource {
  type: AskSourceType
  /** Record id used to deep-link into the relevant hub. */
  id: string
  /** Human label shown on the chip. */
  label: string
}

export interface AskMessage {
  id: string
  role: AskRole
  content: string
  /** Assistant messages carry the records they were grounded in. */
  sources?: AskSource[]
  createdAt: number
}

export interface AskSession {
  id: string
  title: string
  messages: AskMessage[]
  createdAt: number
  updatedAt: number
}

/** Wire shape sent to the backend. History excludes ids/sources by contract. */
export interface AskRequest {
  question: string
  history: { role: AskRole; content: string }[]
}

export interface AskResponse {
  answer: string
  sources: AskSource[]
}
