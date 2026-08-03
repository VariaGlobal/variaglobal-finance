'use client'

/**
 * localStorage-backed session store for the Ask panel.
 *
 * "For now" persistence — sessions live on the device until the backend owns
 * threads. Kept deliberately small: the panel reads sessions + the active id,
 * and mutates through a handful of intent-named actions. All writes flush to
 * localStorage synchronously so a reload restores the exact thread state.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AskMessage, AskSession } from '@/lib/ask/types'

const STORAGE_KEY = 'varia.ask.sessions.v1'

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function firstLine(text: string, max = 48): string {
  const line = text.trim().split('\n')[0]
  return line.length > max ? `${line.slice(0, max).trimEnd()}…` : line
}

function load(): AskSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as AskSession[]) : []
  } catch {
    return []
  }
}

export interface UseAskSessions {
  sessions: AskSession[]
  activeId: string | null
  activeSession: AskSession | null
  /** True once we've hydrated from localStorage (avoids SSR flash). */
  hydrated: boolean
  startNewChat: () => void
  selectSession: (id: string) => void
  renameSession: (id: string, title: string) => void
  deleteSession: (id: string) => void
  /** Append a message to the active session, creating one if needed. */
  appendMessage: (message: Omit<AskMessage, 'id' | 'createdAt'>) => AskMessage
}

export function useAskSessions(): UseAskSessions {
  const [sessions, setSessions] = useState<AskSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const activeIdRef = useRef<string | null>(null)
  activeIdRef.current = activeId

  // Hydrate once on mount.
  useEffect(() => {
    const loaded = load()
    setSessions(loaded)
    setActiveId(loaded[0]?.id ?? null)
    setHydrated(true)
  }, [])

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch {
      // Quota or privacy mode — non-fatal; sessions stay in memory.
    }
  }, [sessions, hydrated])

  const startNewChat = useCallback(() => setActiveId(null), [])

  const selectSession = useCallback((id: string) => setActiveId(id), [])

  const renameSession = useCallback((id: string, title: string) => {
    const clean = title.trim()
    if (!clean) return
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: clean, updatedAt: Date.now() } : s)),
    )
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeIdRef.current === id) setActiveId(null)
  }, [])

  const appendMessage = useCallback<UseAskSessions['appendMessage']>((message) => {
    const full: AskMessage = { ...message, id: uid('msg'), createdAt: Date.now() }
    setSessions((prev) => {
      const currentId = activeIdRef.current
      const existing = currentId ? prev.find((s) => s.id === currentId) : undefined

      if (existing) {
        return prev.map((s) =>
          s.id === existing.id
            ? { ...s, messages: [...s.messages, full], updatedAt: full.createdAt }
            : s,
        )
      }

      // No active session yet — spin one up, titled from the first user message.
      const id = uid('sess')
      activeIdRef.current = id
      const session: AskSession = {
        id,
        title: message.role === 'user' ? firstLine(message.content) : 'New chat',
        messages: [full],
        createdAt: full.createdAt,
        updatedAt: full.createdAt,
      }
      // Defer the active-id state update out of this setState pass.
      queueMicrotask(() => setActiveId(id))
      return [session, ...prev]
    })
    return full
  }, [])

  const activeSession = activeId ? (sessions.find((s) => s.id === activeId) ?? null) : null

  return {
    sessions,
    activeId,
    activeSession,
    hydrated,
    startNewChat,
    selectSession,
    renameSession,
    deleteSession,
    appendMessage,
  }
}
