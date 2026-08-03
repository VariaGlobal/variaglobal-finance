'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsIcon } from 'lucide-react'
import { TopNav, type SubTab } from '@/components/shell/top-nav'
import { CommandPalette } from '@/components/shell/command-palette'
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
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
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
      />
    </div>
  )
}
