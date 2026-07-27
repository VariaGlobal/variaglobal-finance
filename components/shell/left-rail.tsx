'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRightIcon, SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'queue', number: '01', label: 'Queue' },
  { id: 'records', number: '02', label: 'Records' },
  { id: 'reports', number: '03', label: 'Reports' },
  { id: 'admin', number: '04', label: 'Admin' },
  { id: 'audit', number: '05', label: 'Audit' },
] as const

const recordsHubs = [
  'People',
  'Clients',
  'Vendors',
  'Contracts',
  'Banking',
  'Time',
  'Documents',
] as const

function notBuiltYet(section: string) {
  toast(`${section} ships in a later phase`, {
    description: 'The Queue is the working surface for this phase.',
  })
}

export function LeftRail({ activeSection = 'queue' }: { activeSection?: string }) {
  const [recordsOpen, setRecordsOpen] = useState(false)
  const router = useRouter()

  return (
    <nav
      aria-label="Primary"
      className="flex h-full w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
    >
      <div className="flex h-14 items-center px-5">
        <span className="text-sm font-medium tracking-tight text-sidebar-foreground">
          Varia Finance
        </span>
      </div>

      <ul className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection
          const isRecords = section.id === 'records'
          return (
            <li key={section.id}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-expanded={isRecords ? recordsOpen : undefined}
                onClick={() => {
                  if (isRecords) {
                    setRecordsOpen((o) => !o)
                  } else if (section.id === 'queue') {
                    if (!isActive) router.push('/')
                  } else if (!isActive) {
                    notBuiltYet(section.label)
                  }
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
              >
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                  {section.number}
                </span>
                <span className="flex-1">{section.label}</span>
                {isRecords && (
                  <ChevronRightIcon
                    className={cn(
                      'size-3.5 text-muted-foreground/50 transition-transform duration-200 ease-out',
                      recordsOpen && 'rotate-90',
                    )}
                  />
                )}
              </button>

              {isRecords && (
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    recordsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <ul className="flex flex-col gap-0.5 overflow-hidden pl-9">
                    {recordsHubs.map((hub) => (
                      <li key={hub} className="first:mt-0.5 last:mb-1">
                        <button
                          type="button"
                          tabIndex={recordsOpen ? 0 : -1}
                          onClick={() => notBuiltYet(`Records · ${hub}`)}
                          className="w-full rounded-md px-2 py-1 text-left text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {hub}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Pinned bottom: Settings */}
      <div className="px-3 pb-2">
        <button
          type="button"
          aria-current={activeSection === 'settings' ? 'page' : undefined}
          onClick={() => {
            if (activeSection !== 'settings') router.push('/settings')
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            activeSection === 'settings'
              ? 'bg-sidebar-accent text-sidebar-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
          )}
        >
          <SettingsIcon aria-hidden className="size-3.5 text-muted-foreground/60" />
          <span className="flex-1">Settings</span>
        </button>
      </div>

      <div className="px-5 pb-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground/50">
          Every dollar, accounted for.
        </p>
      </div>
    </nav>
  )
}
