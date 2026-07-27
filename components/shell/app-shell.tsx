'use client'

import { useEffect, useState } from 'react'
import { LeftRail } from '@/components/shell/left-rail'
import { TopBar } from '@/components/shell/top-bar'
import { CommandPalette } from '@/components/shell/command-palette'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

interface AppShellProps {
  activeSection?: string
  entity: Entity
  onEntityChange: (entity: Entity) => void
  chips: FilterChip[]
  onChipsChange: (chips: FilterChip[]) => void
  user: AppUser
  onUserChange: (user: AppUser) => void
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
  children,
}: AppShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)

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

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <LeftRail activeSection={activeSection} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          entity={entity}
          onEntityChange={onEntityChange}
          chips={chips}
          onChipsChange={onChipsChange}
          user={user}
          onUserChange={onUserChange}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
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
