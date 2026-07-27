'use client'

import {
  BanknoteIcon,
  BookmarkIcon,
  BuildingIcon,
  InboxIcon,
  MoonIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { entities, savedViews } from '@/lib/fixtures/workspace'
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

  function run(action: () => void) {
    action()
    onOpenChange(false)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search sections, entities, views, and actions"
    >
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => run(() => {})}>
            <InboxIcon />
            01 Queue
          </CommandItem>
          <CommandItem onSelect={() => run(() => {})}>
            <UsersIcon />
            02 Records
          </CommandItem>
          <CommandItem onSelect={() => run(() => {})}>
            <BanknoteIcon />
            03 Reports
          </CommandItem>
          <CommandItem onSelect={() => run(() => {})}>
            <BuildingIcon />
            04 Admin
          </CommandItem>
          <CommandItem onSelect={() => run(() => {})}>
            <ShieldIcon />
            05 Audit
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
            <MoonIcon />
            Toggle theme
          </CommandItem>
          <CommandItem onSelect={() => run(() => onChipsChange([]))}>
            <BookmarkIcon />
            Clear all filters
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
