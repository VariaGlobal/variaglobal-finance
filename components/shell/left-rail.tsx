'use client'

import { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
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

export function LeftRail({ activeSection = 'queue' }: { activeSection?: string }) {
  const [recordsOpen, setRecordsOpen] = useState(false)

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
                  if (isRecords) setRecordsOpen((o) => !o)
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
                      'size-3.5 text-muted-foreground/50 transition-transform duration-150',
                      recordsOpen && 'rotate-90',
                    )}
                  />
                )}
              </button>

              {isRecords && recordsOpen && (
                <ul className="mt-0.5 flex flex-col gap-0.5 pb-1 pl-9">
                  {recordsHubs.map((hub) => (
                    <li key={hub}>
                      <button
                        type="button"
                        className="w-full rounded-md px-2 py-1 text-left text-[13px] text-muted-foreground transition-colors duration-150 outline-none hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {hub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <div className="px-5 pb-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground/50">
          Every dollar, accounted for.
        </p>
      </div>
    </nav>
  )
}
