'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { SettingsScreen } from '@/components/settings/settings-screen'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

export default function SettingsPage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])

  return (
    <AppShell
      activeSection="settings"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
    >
      <SettingsScreen />
    </AppShell>
  )
}
