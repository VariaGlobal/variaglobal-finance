'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  Loader2Icon,
  MessageSquarePlusIcon,
  PanelRightCloseIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SourceChip } from '@/components/ask/source-chip'
import { askBrain, probeAskEndpoint } from '@/lib/ask/client'
import { useAskSessions } from '@/lib/ask/use-ask-sessions'
import type { AskMessage, AskSession } from '@/lib/ask/types'

const SUGGESTIONS = [
  'What did we pay out in July?',
  "Who isn't approved for the Aug 15 run?",
  "Show Ani's owner draws this quarter",
]

interface AskPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Query handed over from ⌘K search; re-applied whenever the nonce changes. */
  seedQuery?: string
  seedNonce?: number
}

export function AskPanel({ open, onOpenChange, seedQuery, seedNonce }: AskPanelProps) {
  const store = useAskSessions()
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [endpointReady, setEndpointReady] = useState<boolean | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = store.activeSession?.messages ?? []
  const canSend = endpointReady === true && input.trim().length > 0 && !asking

  // Probe the brain endpoint on open (and re-probe if it ships mid-session).
  useEffect(() => {
    if (!open) return
    let active = true
    const controller = new AbortController()
    setEndpointReady((prev) => (prev === true ? prev : null))
    probeAskEndpoint(controller.signal).then((ready) => {
      if (active) setEndpointReady(ready)
    })
    return () => {
      active = false
      controller.abort()
    }
  }, [open])

  // Apply a seeded query from the command palette handoff.
  useEffect(() => {
    if (seedNonce === undefined || !seedQuery) return
    setShowHistory(false)
    setInput(seedQuery)
    // Focus after the panel transition so the caret lands correctly.
    const t = setTimeout(() => textareaRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [seedNonce, seedQuery])

  // Keep the thread pinned to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, asking])

  const send = useCallback(async () => {
    const question = input.trim()
    if (!question || endpointReady !== true || asking) return

    // Snapshot history BEFORE appending the new user turn.
    const history = messages.map((m) => ({ role: m.role, content: m.content }))
    store.appendMessage({ role: 'user', content: question })
    setInput('')
    setError(null)
    setAsking(true)

    try {
      const res = await askBrain({ question, history })
      store.appendMessage({ role: 'assistant', content: res.answer, sources: res.sources })
    } catch {
      // Never invent a reply — surface the failure honestly.
      setError('The brain could not answer that just now. Please try again.')
    } finally {
      setAsking(false)
    }
  }, [input, endpointReady, asking, messages, store])

  function onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      if (canSend) send()
    }
  }

  function useSuggestion(text: string) {
    setInput(text)
    textareaRef.current?.focus()
  }

  return (
    <>
      {/* Scrim — light; clicking closes. */}
      <div
        aria-hidden
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 z-40 bg-foreground/10 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Ask your records"
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-border bg-background shadow-xl',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SparklesIcon aria-hidden className="size-4 text-foreground" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">Ask</span>
            <span className="text-[11px] leading-none text-muted-foreground">
              Answers grounded in your records
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={showHistory ? 'Back to chat' : 'New chat'}
            title={showHistory ? 'Back to chat' : 'New chat'}
            onClick={() => {
              if (showHistory) {
                setShowHistory(false)
              } else {
                store.startNewChat()
                setError(null)
                setInput('')
              }
            }}
          >
            {showHistory ? <ArrowLeftIcon className="size-4" /> : <MessageSquarePlusIcon className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Chat history"
            title="Chat history"
            aria-pressed={showHistory}
            onClick={() => setShowHistory((v) => !v)}
            className={cn(showHistory && 'text-foreground')}
          >
            <HistoryGlyph />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close Ask panel"
            title="Close"
            onClick={() => onOpenChange(false)}
          >
            <PanelRightCloseIcon className="size-4" />
          </Button>
        </div>

        {showHistory ? (
          <HistoryView
            store={store}
            onPick={(id) => {
              store.selectSession(id)
              setShowHistory(false)
            }}
          />
        ) : (
          <>
            {/* Thread */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <EmptyState onUse={useSuggestion} />
              ) : (
                <div className="flex flex-col gap-5 px-4 py-5">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} onNavigate={() => onOpenChange(false)} />
                  ))}
                  {asking && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Reading the records…
                    </div>
                  )}
                  {error && (
                    <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      {error}
                    </p>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-border p-3">
              <div className="relative flex items-end gap-2 rounded-xl border border-input bg-card p-2 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  rows={1}
                  placeholder="Ask about people, cycles, invoices, money…"
                  aria-label="Ask a question about your records"
                  className="max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent px-1.5 py-1.5 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  size="icon-sm"
                  aria-label="Send question"
                  disabled={!canSend}
                  onClick={send}
                  className="shrink-0"
                >
                  {asking ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
                </Button>
              </div>

              {/* Honest status line — no faked readiness. */}
              <div className="flex items-center justify-between px-1 pt-2">
                {endpointReady === false ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-held" />
                    Brain endpoint pending — sending is disabled until it&apos;s live
                  </span>
                ) : endpointReady === null ? (
                  <span className="text-[11px] text-muted-foreground">Checking the brain…</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Answers cite the records they came from
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                  <Kbd>⏎</Kbd> send
                </span>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

/* ── Thread pieces ──────────────────────────────────────────────────── */

function MessageBubble({
  message,
  onNavigate,
}: {
  message: AskMessage
  onNavigate: () => void
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-sm text-background">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[92%] text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {message.content}
      </div>
      {message.sources && message.sources.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground/60 uppercase">
            Sources
          </span>
          <div className="flex flex-wrap gap-1.5">
            {message.sources.map((s) => (
              <SourceChip key={`${s.type}-${s.id}`} source={s} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onUse }: { onUse: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-5 px-4 py-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-balance text-base font-medium text-foreground">
          Ask anything about your records
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          People, pay cycles, invoices, counterparties, and bank activity — every answer
          links back to the records it came from.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground/60 uppercase">
          Try
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onUse(s)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── History ────────────────────────────────────────────────────────── */

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function HistoryView({
  store,
  onPick,
}: {
  store: ReturnType<typeof useAskSessions>
  onPick: (id: string) => void
}) {
  const today = startOfToday()
  const sorted = [...store.sessions].sort((a, b) => b.updatedAt - a.updatedAt)
  const groups: { label: string; items: AskSession[] }[] = [
    { label: 'Today', items: sorted.filter((s) => s.updatedAt >= today) },
    { label: 'Earlier', items: sorted.filter((s) => s.updatedAt < today) },
  ].filter((g) => g.items.length > 0)

  if (store.sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6 text-center">
        <p className="text-sm text-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Your chats will collect here.</p>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto py-2">
      {groups.map((group) => (
        <div key={group.label} className="mb-2">
          <p className="px-4 py-1.5 text-[10px] font-medium tracking-[0.08em] text-muted-foreground/60 uppercase">
            {group.label}
          </p>
          {group.items.map((s) => (
            <HistoryRow
              key={s.id}
              session={s}
              active={s.id === store.activeId}
              onPick={() => onPick(s.id)}
              onRename={(title) => store.renameSession(s.id, title)}
              onDelete={() => store.deleteSession(s.id)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function HistoryRow({
  session,
  active,
  onPick,
  onRename,
  onDelete,
}: {
  session: AskSession
  active: boolean
  onPick: () => void
  onRename: (title: string) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(session.title)

  function commit() {
    setEditing(false)
    if (draft.trim() && draft.trim() !== session.title) onRename(draft)
    else setDraft(session.title)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 px-2',
        active && 'bg-muted/60',
      )}
    >
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(session.title)
              setEditing(false)
            }
          }}
          className="my-1 h-7 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex min-w-0 flex-1 flex-col py-2 pl-2 text-left"
        >
          <span className="truncate text-sm text-foreground">{session.title}</span>
          <span className="text-[11px] text-muted-foreground">
            {session.messages.length} message{session.messages.length === 1 ? '' : 's'}
          </span>
        </button>
      )}

      {!editing && (
        <div className="flex shrink-0 items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Rename conversation"
            title="Rename"
            onClick={() => {
              setDraft(session.title)
              setEditing(true)
            }}
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete conversation"
            title="Delete"
            onClick={onDelete}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

/** Small clock-with-arrow history glyph (kept inline to avoid icon sprawl). */
function HistoryGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
