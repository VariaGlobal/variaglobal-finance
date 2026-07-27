'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { QueueScreen } from '@/components/queue/queue-screen'
import { workItems } from '@/lib/fixtures/work-items'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

export default function QueuePage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])

  return (
    <AppShell
      activeSection="queue"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
    >
      <QueueScreen items={workItems} entity={entity} chips={chips} user={user} />
    </AppShell>
  )
}
