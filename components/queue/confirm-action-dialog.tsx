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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {item && action && (
          <>
            <DialogHeader>
              <DialogTitle className="text-pretty">
                {action.confirm?.title ?? action.label}
              </DialogTitle>
              <DialogDescription>{item.meta.join(' · ')}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-3.5 py-3">
                {(action.confirm?.records ?? []).map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[13px] leading-relaxed text-foreground"
                  >
                    <span aria-hidden className="text-muted-foreground/60">
                      —
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
                    rows={2}
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
              <Button
                size="sm"
                disabled={!canConfirm}
                onClick={() => {
                  onConfirm(needsReason ? reason.trim() : undefined)
                  setReason('')
                }}
              >
                {action.label} and record
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
