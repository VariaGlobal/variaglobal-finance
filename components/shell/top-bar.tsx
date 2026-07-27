'use client'

import { useState } from 'react'
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

interface TopBarProps {
  entity: Entity
  onEntityChange: (entity: Entity) => void
  chips: FilterChip[]
  onChipsChange: (chips: FilterChip[]) => void
  user: AppUser
  onUserChange: (user: AppUser) => void
  onOpenPalette: () => void
}

export function TopBar({
  entity,
  onEntityChange,
  chips,
  onChipsChange,
  user,
  onUserChange,
  onOpenPalette,
}: TopBarProps) {
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

  return (
    <header className="flex flex-col border-b border-border bg-background">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Entity switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 font-medium">
                {entity.name}
                <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Entity</DropdownMenuLabel>
            <DropdownMenuGroup>
              {entities.map((e) => (
                <DropdownMenuItem key={e.id} onClick={() => onEntityChange(e)}>
                  <span className="flex-1">{e.name}</span>
                  {e.id === entity.id && <CheckIcon className="size-3.5" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Plain-English filter input */}
        <div className="relative flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border border-input bg-card px-2.5 transition-colors duration-150 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
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
            placeholder='Filter in plain English — "matchbox july variance"'
            aria-label="Filter work items in plain English"
            className="h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          {noMatch && (
            <span className="absolute -bottom-5 left-0 text-[11px] text-muted-foreground">
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
            <DropdownMenuLabel>Saved views</DropdownMenuLabel>
            <DropdownMenuGroup>
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

        <div className="flex items-center gap-1">
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
              <DropdownMenuLabel>Acting as</DropdownMenuLabel>
              <DropdownMenuGroup>
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

      {/* Filter chips — visible query logic */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2.5">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-full border border-border bg-secondary pr-1 pl-2.5 text-xs text-secondary-foreground',
                'animate-in fade-in zoom-in-95 duration-150',
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
