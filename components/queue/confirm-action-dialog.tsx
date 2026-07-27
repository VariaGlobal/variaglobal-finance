'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AppUser, WorkItem, WorkItemAction } from '@/lib/types'

interface ConfirmActionDialogProps {
  item: WorkItem | null
  action: WorkItemAction | null
  user: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason?: string) => void
}

/**
 * Every money-bearing action states exactly what will be recorded, by whom,
 * reversible only by correction. Waiving (and similar) requires a reason.
 */
export function ConfirmActionDialog({
  item,
  action,
  user,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [reason, setReason] = useState('')
  const needsReason = Boolean(action?.requiresReason)
  const canConfirm = !needsReason || reason.trim().length > 0

  function handleOpenChange(next: boolean) {
    if (!next) setReason('')
    onOpenChange(next)
  }

  function confirm() {
    if (!canConfirm) return
    onConfirm(needsReason ? reason.trim() : undefined)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {item && action && (
          <>
            <DialogHeader>
              <DialogTitle className="text-title font-semibold tracking-tight text-pretty">
                {action.confirm?.title ?? action.label}
              </DialogTitle>
              <DialogDescription className="text-meta">
                {item.meta.join(' · ')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {/* Reads like a signed document: itemized, hairline-separated. */}
              <ul className="flex flex-col border-t border-border">
                {(action.confirm?.records ?? []).map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 border-b border-border py-2.5 text-[13px] leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden
                      className="font-mono text-xs text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              {needsReason && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="action-reason"
                    className="text-xs font-medium text-foreground"
                  >
                    Reason (required, stored on the record)
                  </label>
                  <textarea
                    id="action-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' &&
                        (e.metaKey || e.ctrlKey) &&
                        !e.nativeEvent.isComposing &&
                        e.keyCode !== 229
                      ) {
                        e.preventDefault()
                        confirm()
                      }
                    }}
                    rows={2}
                    autoFocus
                    placeholder="Why is this being waived?"
                    className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground transition-colors duration-150 outline-none placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                Recorded by {user.name} ({user.roleLabel}). Records are never
                edited — reversible only by correction.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={!canConfirm} onClick={confirm}>
                {action.confirm?.confirmLabel ?? `${action.label} and record`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
