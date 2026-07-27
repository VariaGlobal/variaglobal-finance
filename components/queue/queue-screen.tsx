'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Kbd } from '@/components/ui/kbd'
import { Skeleton } from '@/components/ui/skeleton'
import { QueueRow } from '@/components/queue/queue-row'
import { QueueEmptyState } from '@/components/queue/queue-empty-state'
import { WorkItemDrawer } from '@/components/queue/work-item-drawer'
import { ConfirmActionDialog } from '@/components/queue/confirm-action-dialog'
import type {
  AppUser,
  Entity,
  FilterChip,
  WorkItem,
  WorkItemAction,
} from '@/lib/types'

interface QueueScreenProps {
  items: WorkItem[]
  entity: Entity
  chips: FilterChip[]
  user: AppUser
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

export function QueueScreen({ items, entity, chips, user }: QueueScreenProps) {
  const [loading, setLoading] = useState(true)
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [exitingIds, setExitingIds] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    item: WorkItem
    action: WorkItemAction
  } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => !resolvedIds.includes(item.id))
      .filter((item) =>
        entity.id === 'varia-global' ? true : item.tags.entity === entity.id,
      )
      .filter((item) => matchesChips(item, chips))
  }, [items, resolvedIds, entity, chips])

  const clampedIndex = Math.min(selectedIndex, Math.max(visibleItems.length - 1, 0))
  const selectedItem = visibleItems[clampedIndex] ?? null

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
      // Cause → effect: the row leaves the queue on approve.
      setExitingIds((ids) => [...ids, item.id])
      setTimeout(() => {
        setResolvedIds((ids) => [...ids, item.id])
        setExitingIds((ids) => ids.filter((id) => id !== item.id))
      }, 250)
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

  if (loading) {
    return (
      <div className="flex flex-col" aria-busy="true" aria-label="Loading queue">
        <QueueHeader count={null} />
        <div className="flex flex-col gap-px">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 border-b border-border px-5 py-4">
              <Skeleton className="mt-1 size-4 rounded" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="h-7 w-36 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col" ref={listRef}>
      <QueueHeader count={visibleItems.length} />

      {visibleItems.length === 0 ? (
        <QueueEmptyState filtered={chips.length > 0 || entity.id !== 'varia-global'} />
      ) : (
        <div role="list" aria-label="Work items">
          {visibleItems.map((item, index) => (
            <div role="listitem" key={item.id}>
              <QueueRow
                item={item}
                selected={index === clampedIndex}
                exiting={exitingIds.includes(item.id)}
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
          ))}
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

function QueueHeader({ count }: { count: number | null }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-medium tracking-tight text-foreground">Queue</h1>
        {count !== null && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <p className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
        <Kbd>J</Kbd>
        <Kbd>K</Kbd>
        move
        <Kbd>↵</Kbd>
        open
        <Kbd>A</Kbd>
        approve
      </p>
    </div>
  )
}
