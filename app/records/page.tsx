'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { HubPlaceholder } from '@/components/shell/hub-placeholder'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

const recordsTabs = [
  { id: 'people', number: '01', label: 'People' },
  { id: 'clients', number: '02', label: 'Clients' },
  { id: 'vendors', number: '03', label: 'Vendors' },
  { id: 'contracts', number: '04', label: 'Contracts' },
  { id: 'banking', number: '05', label: 'Banking' },
  { id: 'time', number: '06', label: 'Time' },
  { id: 'documents', number: '07', label: 'Documents' },
] as const

const sublines: Record<string, string> = {
  people: 'Contractor records, rate history, and routing ship with the records phase.',
  clients: 'Client records, contracts, and hours ship with the records phase.',
  vendors: 'Vendor records and recurring charges ship with the records phase.',
  contracts: 'Contract terms, rules, and effective dating ship with the records phase.',
  banking: 'Bank transactions and reconciliation ship with the records phase.',
  time: 'Time entries and origin periods ship with the records phase.',
  documents: 'Statements, contracts, and compliance docs ship with the records phase.',
}

export default function RecordsPage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])
  const [activeTab, setActiveTab] = useState<string>('people')

  const tab = recordsTabs.find((t) => t.id === activeTab) ?? recordsTabs[0]

  return (
    <AppShell
      activeSection="records"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
      subTabs={[...recordsTabs]}
      activeSubTab={activeTab}
      onSubTabChange={setActiveTab}
    >
      <div className="flex min-h-full flex-col">
        <HubPlaceholder
          title={`${tab.label} — one record of truth.`}
          subline={sublines[tab.id]}
        />
      </div>
    </AppShell>
  )
}
