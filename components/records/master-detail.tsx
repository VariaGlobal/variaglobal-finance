'use client'

/**
 * Unified list + detail layout for Records hubs, framed inside a single
 * canvas. A shared PageHeader spans the top; below it a fixed-width list rail
 * sits on the left with the selected record's detail filling the rest. On
 * mobile the detail replaces the list (back button returns). One screen, no
 * page swaps — the backbone of the simplified Records design.
 */

import { ArrowLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HubCanvas } from '@/components/records/records-bits'

export function MasterDetail({
  header,
  list,
  detail,
  hasSelection,
  onBack,
  backLabel = 'Back',
  emptyDetail,
  selectionKey,
}: {
  /** Shared page header (title, count, description, action) spanning the top. */
  header?: React.ReactNode
  list: React.ReactNode
  detail: React.ReactNode
  hasSelection: boolean
  onBack: () => void
  backLabel?: string
  /** Shown in the detail pane on desktop when nothing is selected. */
  emptyDetail: React.ReactNode
  /** Changing this key re-runs the detail entrance animation. */
  selectionKey?: string | null
}) {
  return (
    <HubCanvas className="p-0">
      {header}
      <div className="flex min-h-0 flex-1 md:grid md:grid-cols-[minmax(300px,360px)_1fr]">
        {/* List rail — hidden on mobile when a record is open */}
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-col border-border md:border-r',
            hasSelection ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto py-3">{list}</div>
        </div>

        {/* Detail pane */}
        <div className={cn('min-h-0 min-w-0 flex-col', hasSelection ? 'flex' : 'hidden md:flex')}>
          {hasSelection && (
            <button
              type="button"
              onClick={onBack}
              className="flex shrink-0 items-center gap-1.5 border-b border-border px-5 py-3 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden"
            >
              <ArrowLeftIcon className="size-3.5" />
              {backLabel}
            </button>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {hasSelection ? (
              <div key={selectionKey ?? 'detail'} className="animate-detail-in">
                {detail}
              </div>
            ) : (
              emptyDetail
            )}
          </div>
        </div>
      </div>
    </HubCanvas>
  )
}

/** Quiet placeholder for the detail pane when nothing is selected. */
export function DetailPlaceholder({ title, subline }: { title: string; subline: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-24 text-center">
      <div
        aria-hidden
        className="mb-1 flex size-11 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground/50"
      >
        <ArrowLeftIcon className="size-4" />
      </div>
      <h2 className="max-w-md font-sans text-lg font-medium tracking-tight text-balance text-foreground/50">
        {title}
      </h2>
      <p className="max-w-xs font-mono text-[13px] leading-relaxed text-muted-foreground">
        {subline}
      </p>
    </div>
  )
}
