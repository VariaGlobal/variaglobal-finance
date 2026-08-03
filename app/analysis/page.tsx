'use client'

import { useState } from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { HubPlaceholder } from '@/components/shell/hub-placeholder'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

const analysisTabs = [
  { id: 'reports', number: '01', label: 'Reports' },
  { id: 'variance', number: '02', label: 'Variance' },
  { id: 'pay-cycles', number: '03', label: 'Pay cycles' },
  { id: 'client-pl', number: '04', label: 'Client P&L' },
] as const

const sublines: Record<string, string> = {
  reports: 'Monthly close packages and entity statements ship with the reporting phase.',
  variance: 'Contract-vs-actual variance analysis ships with the reporting phase.',
  'pay-cycles': 'Historical pay-cycle analysis ships with the reporting phase.',
  'client-pl': 'Per-client profitability ships with the reporting phase.',
}

export default function AnalysisPage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])
  const [activeTab, setActiveTab] = useState<string>('reports')

  const tab = analysisTabs.find((t) => t.id === activeTab) ?? analysisTabs[0]

  return (
    <AppShell
      activeSection="analysis"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
      subTabs={[...analysisTabs]}
      activeSubTab={activeTab}
      onSubTabChange={setActiveTab}
    >
      <div key={activeTab} className="flex min-h-full flex-1 flex-col">
        <HubPlaceholder
          title={`${tab.label} — every number, explained.`}
          subline={sublines[tab.id]}
        />
      </div>
    </AppShell>
  )
}
