'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BanknoteIcon,
  BookmarkIcon,
  BuildingIcon,
  InboxIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { RecordHover } from '@/components/records/record-hover'
import { entities, savedViews } from '@/lib/fixtures/workspace'
import { searchRecords } from '@/lib/fixtures/records/search-index'
import type { Entity, FilterChip } from '@/lib/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEntityChange: (entity: Entity) => void
  onChipsChange: (chips: FilterChip[]) => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onEntityChange,
  onChipsChange,
}: CommandPaletteProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')

  /** Record results computed from the flat index — grouped by hub. */
  const recordGroups = useMemo(() => searchRecords(query), [query])

  function run(action: () => void) {
    action()
    handleOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) setQuery('')
    onOpenChange(next)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Command palette"
      description="Search all records, sections, entities, views, and actions"
    >
      {/* shouldFilter off: record search is token-AND matched by the index;
          static commands are filtered the same way via visibility below. */}
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search records, or type a command…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Record results — grouped by hub, with the same hover cards. */}
          {recordGroups.map((group) => (
            <CommandGroup key={group.hub} heading={group.hub}>
              {group.entries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  value={entry.id}
                  onSelect={() =>
                    run(() => {
                      const params = new URLSearchParams({ tab: entry.target.tab })
                      if (entry.target.openId) params.set('open', entry.target.openId)
                      router.push(`/records?${params.toString()}`)
                    })
                  }
                >
                  <RecordHover recordId={entry.summaryId} className="min-w-0 no-underline">
                    <span className="truncate">{entry.title}</span>
                  </RecordHover>
                  {entry.detail && (
                    <span className="ml-auto max-w-[50%] truncate text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {entry.detail}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {/* Static commands — shown when not searching records. */}
          {query.trim() === '' && (
            <>
              <CommandGroup heading="Go to">
                <CommandItem onSelect={() => run(() => router.push('/analysis'))}>
                  <BanknoteIcon />
                  01 Analysis
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push('/'))}>
                  <InboxIcon />
                  02 Queue
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push('/records'))}>
                  <UsersIcon />
                  03 Records
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push('/settings'))}>
                  <SettingsIcon />
                  Settings · Admin · Audit
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Switch entity">
                {entities.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    onSelect={() => run(() => onEntityChange(entity))}
                  >
                    <BuildingIcon />
                    {entity.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Saved views">
                {savedViews.map((view) => (
                  <CommandItem
                    key={view.id}
                    onSelect={() => run(() => onChipsChange(view.chips))}
                  >
                    <BookmarkIcon />
                    {view.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() =>
                    run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))
                  }
                >
                  {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                  {resolvedTheme === 'dark'
                    ? 'Switch to light theme'
                    : 'Switch to dark theme'}
                </CommandItem>
                <CommandItem onSelect={() => run(() => onChipsChange([]))}>
                  <BookmarkIcon />
                  Clear all filters
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
