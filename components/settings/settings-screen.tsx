'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { IntegrationsTab } from '@/components/settings/integrations-tab'
import { RulesTab } from '@/components/settings/rules-tab'
import { UsersTab } from '@/components/settings/users-tab'
import { PromptsTab } from '@/components/settings/prompts-tab'
import { ArchitectureTab } from '@/components/settings/architecture-tab'
import { SystemHealthTab } from '@/components/settings/system-health-tab'
import { AdminTab } from '@/components/settings/admin-tab'
import { AuditTab } from '@/components/settings/audit-tab'

const tabs = [
  { id: 'integrations', number: '01', label: 'Integrations', component: IntegrationsTab },
  { id: 'rules', number: '02', label: 'Rules', component: RulesTab },
  { id: 'users', number: '03', label: 'Users & roles', component: UsersTab },
  { id: 'prompts', number: '04', label: 'Prompt library', component: PromptsTab },
  { id: 'architecture', number: '05', label: 'Architecture', component: ArchitectureTab },
  { id: 'health', number: '06', label: 'System health', component: SystemHealthTab },
  { id: 'admin', number: '07', label: 'Admin', component: AdminTab },
  { id: 'audit', number: '08', label: 'Audit', component: AuditTab },
] as const

type TabId = (typeof tabs)[number]['id']

export function SettingsScreen() {
  const [activeId, setActiveId] = useState<TabId>('integrations')
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const ActiveComponent = active.component

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-baseline gap-3 px-5 pt-6 pb-4">
        <h1 className="text-lg font-medium tracking-tight text-foreground">
          Settings
        </h1>
        <span className="text-meta">configuration · fixtures this phase</span>
      </div>

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex items-center gap-1 overflow-x-auto border-b border-border px-5"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`settings-panel-${tab.id}`}
              id={`settings-tab-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'relative flex shrink-0 items-baseline gap-2 px-2.5 pt-1 pb-2.5 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                {tab.number}
              </span>
              {tab.label}
              {/* Active: hairline underline in foreground — not an accent flood. */}
              <span
                aria-hidden
                className={cn(
                  'absolute inset-x-2.5 bottom-0 h-px transition-colors duration-150',
                  isActive ? 'bg-foreground' : 'bg-transparent',
                )}
              />
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`settings-panel-${active.id}`}
        aria-labelledby={`settings-tab-${active.id}`}
        className="flex-1 px-5 py-6"
      >
        <ActiveComponent />
      </div>
    </div>
  )
}
