'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { HubPlaceholder } from '@/components/shell/hub-placeholder'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

/**
 * Queue is parked as a TBD while we focus on Records. The tab structure stays
 * so navigation is intact; the working triage screen lives in git history.
 */
const queueTabs = [
  { id: 'all', number: '01', label: 'All items' },
  { id: 'pay-cycle', number: '02', label: 'Pay cycle' },
  { id: 'invoicing', number: '03', label: 'Invoicing' },
  { id: 'exceptions', number: '04', label: 'Exceptions' },
] as const

const sublines: Record<string, string> = {
  all: 'The unified triage inbox is being redesigned. Records is the current focus.',
  'pay-cycle': 'Pay-cycle triage returns once the Records foundation is settled.',
  invoicing: 'Invoice and card-statement triage returns in a later phase.',
  exceptions: 'Bank-match and exception triage returns in a later phase.',
}

export default function QueuePage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])
  const [activeTab, setActiveTab] = useState<string>('all')

  const tab = queueTabs.find((t) => t.id === activeTab) ?? queueTabs[0]

  return (
    <AppShell
      activeSection="queue"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
      subTabs={[...queueTabs]}
      activeSubTab={activeTab}
      onSubTabChange={setActiveTab}
    >
      <div key={activeTab} className="flex min-h-full flex-1 flex-col">
        <HubPlaceholder title={`${tab.label} — coming back soon.`} subline={sublines[tab.id]} />
      </div>
    </AppShell>
  )
}
