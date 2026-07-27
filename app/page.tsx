'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { QueueScreen } from '@/components/queue/queue-screen'
import { workItems } from '@/lib/fixtures/work-items'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip, WorkItemType } from '@/lib/types'

/** Queue sub-tabs map straight onto work-item types. */
const queueTabs = [
  { id: 'all', number: '01', label: 'All items', types: null },
  { id: 'pay-cycle', number: '02', label: 'Pay cycle', types: ['pay_cycle'] },
  {
    id: 'invoicing',
    number: '03',
    label: 'Invoicing',
    types: ['invoice_variance', 'card_statement'],
  },
  {
    id: 'exceptions',
    number: '04',
    label: 'Exceptions',
    types: ['bank_match', 'overage', 'missing_contract'],
  },
] as const satisfies ReadonlyArray<{
  id: string
  number: string
  label: string
  types: readonly WorkItemType[] | null
}>

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
      subTabs={queueTabs.map(({ id, number, label }) => ({ id, number, label }))}
      activeSubTab={activeTab}
      onSubTabChange={setActiveTab}
    >
      <QueueScreen
        items={workItems}
        entity={entity}
        chips={chips}
        user={user}
        typeFilter={tab.types ? [...tab.types] : undefined}
      />
    </AppShell>
  )
}
