'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookmarkIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  XIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'
import {
  compileFilterText,
  entities,
  savedViews,
  users,
} from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

const chipKindLabel: Record<FilterChip['kind'], string> = {
  entity: 'entity',
  client: 'client',
  person: 'person',
  period: 'period',
  status: 'status',
}

/** The three primary sections in the big horizontal menu. */
const primarySections = [
  { id: 'analysis', number: '01', label: 'Analysis', href: '/analysis' },
  { id: 'queue', number: '02', label: 'Queue', href: '/' },
  { id: 'records', number: '03', label: 'Records', href: '/records' },
] as const

export interface SubTab {
  id: string
  number: string
  label: string
}

interface TopNavProps {
  activeSection: string
  entity: Entity
  onEntityChange: (entity: Entity) => void
  chips: FilterChip[]
  onChipsChange: (chips: FilterChip[]) => void
  user: AppUser
  onUserChange: (user: AppUser) => void
  onOpenPalette: () => void
  /** Sub-tabs for the active section. Omit (or empty) to hide the row. */
  subTabs?: SubTab[]
  activeSubTab?: string
  onSubTabChange?: (id: string) => void
}

export function TopNav({
  activeSection,
  entity,
  onEntityChange,
  chips,
  onChipsChange,
  user,
  onUserChange,
  onOpenPalette,
  subTabs,
  activeSubTab,
  onSubTabChange,
}: TopNavProps) {
  const router = useRouter()
  const [filterText, setFilterText] = useState('')
  const [noMatch, setNoMatch] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  function submitFilter() {
    const text = filterText.trim()
    if (!text) return
    const compiled = compileFilterText(text)
    const fresh = compiled.filter((c) => !chips.some((existing) => existing.id === c.id))
    if (fresh.length === 0 && compiled.length === 0) {
      setNoMatch(true)
      setTimeout(() => setNoMatch(false), 1600)
      return
    }
    onChipsChange([...chips, ...fresh])
    setFilterText('')
  }

  function removeChip(id: string) {
    onChipsChange(chips.filter((c) => c.id !== id))
  }

  const showSubTabRow = Boolean(subTabs && subTabs.length > 0)

  return (
    <header className="flex flex-col border-b border-border bg-background">
      {/* Row 1: brand · big section menu · workspace controls */}
      <div className="flex h-14 items-center gap-6 border-b border-border px-5">
        <p className="shrink-0 text-sm font-medium tracking-tight text-foreground">
          Varia <span className="text-muted-foreground">Finance</span>
        </p>

        <nav aria-label="Primary" className="flex h-full items-stretch gap-1">
          {primarySections.map((section) => {
            const isActive = section.id === activeSection
            return (
              <button
                key={section.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  if (!isActive) router.push(section.href)
                }}
                className={cn(
                  'relative flex items-baseline gap-2 self-stretch px-3 pt-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="self-center font-mono text-[11px] tabular-nums text-muted-foreground/60">
                  {section.number}
                </span>
                <span className="text-title self-center font-medium">
                  {section.label}
                </span>
                {/* Active: hairline underline, not an accent flood. */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-px transition-colors duration-150',
                    isActive ? 'bg-foreground' : 'bg-transparent',
                  )}
                />
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Entity switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2 font-medium">
                  {entity.name}
                  <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Entity</DropdownMenuLabel>
                {entities.map((e) => (
                  <DropdownMenuItem key={e.id} onClick={() => onEntityChange(e)}>
                    <span className="flex-1">{e.name}</span>
                    {e.id === entity.id && <CheckIcon className="size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Command palette hint */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenPalette}
            className="gap-1.5 text-muted-foreground"
          >
            <Kbd>⌘K</Kbd>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            <SunIcon className="hidden size-4 dark:block" />
            <MoonIcon className="size-4 dark:hidden" />
          </Button>

          {/* Fake user switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-secondary-foreground">
                    {user.name[0]}
                  </span>
                  {user.name}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Acting as</DropdownMenuLabel>
                {users.map((u) => (
                  <DropdownMenuItem key={u.id} onClick={() => onUserChange(u)}>
                    <span className="flex-1">{u.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.roleLabel}
                    </span>
                    {u.id === user.id && <CheckIcon className="ml-1 size-3.5" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Row 2: active section's sub-tabs · filter tools */}
      {showSubTabRow && (
        <div className="flex items-center gap-4 px-5">
          <div
            role="tablist"
            aria-label={`${activeSection} sections`}
            className="flex items-center gap-1 overflow-x-auto"
          >
            {subTabs!.map((tab) => {
              const isActive = tab.id === activeSubTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSubTabChange?.(tab.id)}
                  className={cn(
                    'relative flex shrink-0 items-baseline gap-2 px-2.5 pt-2 pb-2.5 text-sm transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                    {tab.number}
                  </span>
                  {tab.label}
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

          <div className="ml-auto flex items-center gap-2 py-1.5">
            {/* Plain-English filter input */}
            <div className="relative flex h-8 w-72 items-center gap-2 rounded-md border border-input bg-card px-2.5 transition-colors duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 max-md:hidden">
              <SearchIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    submitFilter()
                  }
                }}
                placeholder='Filter — "matchbox july variance"'
                aria-label="Filter work items in plain English"
                className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              {noMatch && (
                <span className="absolute -bottom-5 left-0 z-10 text-[11px] text-muted-foreground">
                  No filter matched — try an entity, client, person, period, or status
                </span>
              )}
            </div>

            {/* Saved views */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <BookmarkIcon data-icon="inline-start" />
                    Views
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Saved views</DropdownMenuLabel>
                  {savedViews.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onClick={() => onChipsChange(view.chips)}
                    >
                      {view.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onChipsChange([])}>
                    Clear all filters
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Filter chips — visible query logic */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-2.5">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-full border border-border pr-1 pl-2.5 text-xs text-foreground',
                // Pop in with a 4px rise, no bounce.
                'animate-in fade-in slide-in-from-bottom-1 duration-150 ease-out',
              )}
            >
              <span className="text-muted-foreground">
                {chipKindLabel[chip.kind]}
              </span>
              {chip.label}
              <button
                type="button"
                aria-label={`Remove filter ${chip.label}`}
                onClick={() => removeChip(chip.id)}
                className="flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChipsChange([])}
            className="ml-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}
    </header>
  )
}
