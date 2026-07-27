'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Rows2Icon, Rows4Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { QueueRow, type QueueDensity } from '@/components/queue/queue-row'
import { QueueEmptyState } from '@/components/queue/queue-empty-state'
import { WorkItemDrawer } from '@/components/queue/work-item-drawer'
import { ConfirmActionDialog } from '@/components/queue/confirm-action-dialog'
import type {
  AppUser,
  Entity,
  FilterChip,
  WorkItem,
  WorkItemAction,
  WorkItemType,
} from '@/lib/types'

interface QueueScreenProps {
  items: WorkItem[]
  entity: Entity
  chips: FilterChip[]
  user: AppUser
  /** Restrict to these work-item types (sub-tab filter). Omit for all. */
  typeFilter?: WorkItemType[]
}

function matchesChips(item: WorkItem, chips: FilterChip[]): boolean {
  const byKind = new Map<string, FilterChip[]>()
  for (const chip of chips) {
    const list = byKind.get(chip.kind) ?? []
    list.push(chip)
    byKind.set(chip.kind, list)
  }
  for (const [kind, kindChips] of byKind) {
    const values = kindChips.map((c) => c.value)
    let ok = false
    if (kind === 'entity') ok = values.includes(item.tags.entity)
    if (kind === 'client') ok = Boolean(item.tags.client && values.includes(item.tags.client))
    if (kind === 'person') ok = Boolean(item.tags.people?.some((p) => values.includes(p)))
    if (kind === 'period') ok = Boolean(item.tags.period && values.includes(item.tags.period))
    if (kind === 'status') ok = values.includes(item.tags.status)
    if (!ok) return false
  }
  return true
}

export function QueueScreen({
  items,
  entity,
  chips,
  user,
  typeFilter,
}: QueueScreenProps) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [exitingIds, setExitingIds] = useState<string[]>([])
  const [density, setDensity] = useState<QueueDensity>('comfortable')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    item: WorkItem
    action: WorkItemAction
  } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => !resolvedIds.includes(item.id))
      .filter((item) => (typeFilter ? typeFilter.includes(item.type) : true))
      .filter((item) =>
        entity.id === 'varia-global' ? true : item.tags.entity === entity.id,
      )
      .filter((item) => matchesChips(item, chips))
  }, [items, resolvedIds, entity, chips, typeFilter])

  const clampedIndex = Math.min(selectedIndex, Math.max(visibleItems.length - 1, 0))
  const selectedItem = visibleItems[clampedIndex] ?? null

  // Keep the keyboard-selected row visible while triaging with J/K.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-selected]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [clampedIndex])

  const runAction = useCallback(
    (item: WorkItem, action: WorkItemAction) => {
      if (action.money) {
        setPendingAction({ item, action })
        return
      }
      // Non-money actions surface the detail drawer this phase.
      setSelectedIndex(visibleItems.indexOf(item))
      setDrawerOpen(true)
    },
    [visibleItems],
  )

  const resolveItem = useCallback(
    (item: WorkItem, action: WorkItemAction, reason?: string) => {
      setPendingAction(null)
      setDrawerOpen(false)
      // Cause → effect: 220ms compress + accent sweep, then the toast.
      setExitingIds((ids) => [...ids, item.id])
      setTimeout(() => {
        setResolvedIds((ids) => [...ids, item.id])
        setExitingIds((ids) => ids.filter((id) => id !== item.id))
      }, 230)
      toast(`${action.label} recorded`, {
        description: reason
          ? `${item.title} · reason: ${reason} · by ${user.name}`
          : `${item.title} · by ${user.name}`,
        action: {
          label: 'View record',
          onClick: () => {
            toast('Records open post-handoff', {
              description: 'The record view ships with the Records hubs.',
            })
          },
        },
      })
    },
    [user.name],
  )

  // Keyboard triage: J/K move, Enter opens drawer, A approves where legal.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        pendingAction
      ) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()
      if (key === 'j') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, visibleItems.length - 1))
      } else if (key === 'k') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && !drawerOpen) {
        if (selectedItem) {
          e.preventDefault()
          setDrawerOpen(true)
        }
      } else if (key === 'a') {
        if (!selectedItem) return
        e.preventDefault()
        const approve = selectedItem.actions.find(
          (a) => a.money && a.resolves && a.intent === 'primary',
        )
        if (!approve) {
          toast('Nothing to approve here', {
            description: `“${selectedItem.title}” has no approvable money action.`,
          })
          return
        }
        if (!user.canApprove) {
          toast('Approval not permitted', {
            description: `${user.name} is ${user.roleLabel}. Switch to Ani to approve.`,
          })
          return
        }
        setPendingAction({ item: selectedItem, action: approve })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [visibleItems.length, selectedItem, drawerOpen, pendingAction, user])

  return (
    <div className="flex min-h-full flex-col" ref={listRef}>
      <QueueHeader
        count={visibleItems.length}
        density={density}
        onDensityChange={setDensity}
      />

      {visibleItems.length === 0 ? (
        <QueueEmptyState
          filtered={
            chips.length > 0 || entity.id !== 'varia-global' || Boolean(typeFilter)
          }
        />
      ) : (
        <div role="list" aria-label="Work items">
          {visibleItems.map((item, index) => {
            const exiting = exitingIds.includes(item.id)
            return (
              <div
                role="listitem"
                key={item.id}
                className={cn(
                  'grid transition-[grid-template-rows] duration-[220ms] ease-out',
                  exiting ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
                )}
              >
                <div className="overflow-hidden">
                  <QueueRow
                    item={item}
                    selected={index === clampedIndex}
                    exiting={exiting}
                    density={density}
                    onOpen={() => {
                      setSelectedIndex(index)
                      setDrawerOpen(true)
                    }}
                    onAction={(action) => {
                      setSelectedIndex(index)
                      runAction(item, action)
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <WorkItemDrawer
        item={selectedItem}
        open={drawerOpen && Boolean(selectedItem)}
        onOpenChange={setDrawerOpen}
        onAction={(action) => {
          if (selectedItem) runAction(selectedItem, action)
        }}
      />

      <ConfirmActionDialog
        item={pendingAction?.item ?? null}
        action={pendingAction?.action ?? null}
        user={user}
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        onConfirm={(reason) => {
          if (pendingAction) {
            resolveItem(pendingAction.item, pendingAction.action, reason)
          }
        }}
      />
    </div>
  )
}

function QueueHeader({
  count,
  density,
  onDensityChange,
}: {
  count: number
  density: QueueDensity
  onDensityChange: (density: QueueDensity) => void
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-medium tracking-tight text-foreground">Queue</h1>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd>
          move
          <Kbd>↵</Kbd>
          open
          <Kbd>A</Kbd>
          approve
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={
            density === 'comfortable'
              ? 'Switch to compact rows'
              : 'Switch to comfortable rows'
          }
          className="text-muted-foreground"
          onClick={() =>
            onDensityChange(density === 'comfortable' ? 'compact' : 'comfortable')
          }
        >
          {density === 'comfortable' ? (
            <Rows4Icon className="size-4" />
          ) : (
            <Rows2Icon className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
