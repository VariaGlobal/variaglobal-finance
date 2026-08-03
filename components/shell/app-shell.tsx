'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsIcon } from 'lucide-react'
import { TopNav, type SubTab } from '@/components/shell/top-nav'
import { CommandPalette } from '@/components/shell/command-palette'
import { AskPanel } from '@/components/ask/ask-panel'
import { cn } from '@/lib/utils'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

interface AppShellProps {
  activeSection?: string
  entity: Entity
  onEntityChange: (entity: Entity) => void
  chips: FilterChip[]
  onChipsChange: (chips: FilterChip[]) => void
  user: AppUser
  onUserChange: (user: AppUser) => void
  subTabs?: SubTab[]
  activeSubTab?: string
  onSubTabChange?: (id: string) => void
  children: React.ReactNode
}

export function AppShell({
  activeSection = 'queue',
  entity,
  onEntityChange,
  chips,
  onChipsChange,
  user,
  onUserChange,
  subTabs,
  activeSubTab,
  onSubTabChange,
  children,
}: AppShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  // Seed carries a query handed over from ⌘K; the nonce re-triggers the panel
  // even when the same query is sent twice.
  const [askSeed, setAskSeed] = useState<{ query: string; nonce: number } | null>(null)
  const router = useRouter()

  // Open the Ask panel, optionally seeding it with a query (e.g. from search).
  const openAsk = useCallback((query?: string) => {
    if (query && query.trim()) {
      setAskSeed({ query: query.trim(), nonce: Date.now() })
    }
    setAskOpen(true)
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setAskOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const onSettings = activeSection === 'settings'

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <TopNav
        activeSection={activeSection}
        entity={entity}
        onEntityChange={onEntityChange}
        chips={chips}
        onChipsChange={onChipsChange}
        user={user}
        onUserChange={onUserChange}
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenAsk={() => openAsk()}
        subTabs={subTabs}
        activeSubTab={activeSubTab}
        onSubTabChange={onSubTabChange}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>

      {/* Pinned bottom-left: Settings (Admin & Audit live inside it) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          aria-current={onSettings ? 'page' : undefined}
          onClick={() => {
            if (!onSettings) router.push('/settings')
          }}
          className={cn(
            'flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            onSettings
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <SettingsIcon aria-hidden className="size-3.5" />
          Settings
        </button>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onEntityChange={onEntityChange}
        onChipsChange={onChipsChange}
        onAskAI={(query) => {
          setPaletteOpen(false)
          openAsk(query)
        }}
      />

      <AskPanel
        open={askOpen}
        onOpenChange={setAskOpen}
        seedQuery={askSeed?.query}
        seedNonce={askSeed?.nonce}
      />
    </div>
  )
}
