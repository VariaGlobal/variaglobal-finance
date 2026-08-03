'use client'

/**
 * Unified list + detail layout for Records hubs. On desktop the list sits in
 * a fixed-width left rail with the selected record's detail filling the rest;
 * on mobile the detail replaces the list (back button returns). This is the
 * backbone of the simplified Records design — one screen, no page swaps.
 */

import { ArrowLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MasterDetail({
  list,
  detail,
  hasSelection,
  onBack,
  backLabel = 'Back',
  emptyDetail,
}: {
  list: React.ReactNode
  detail: React.ReactNode
  hasSelection: boolean
  onBack: () => void
  backLabel?: string
  /** Shown in the detail pane on desktop when nothing is selected. */
  emptyDetail: React.ReactNode
}) {
  return (
    <div className="flex min-h-full flex-1 md:grid md:grid-cols-[minmax(280px,340px)_1fr]">
      {/* List rail — hidden on mobile when a record is open */}
      <div
        className={cn(
          'flex min-w-0 flex-col border-border md:border-r',
          hasSelection ? 'hidden md:flex' : 'flex',
        )}
      >
        <ScrollArea className="flex-1">{list}</ScrollArea>
      </div>

      {/* Detail pane */}
      <div className={cn('min-w-0 flex-col', hasSelection ? 'flex' : 'hidden md:flex')}>
        {hasSelection && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 border-b border-border px-5 py-2.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden"
          >
            <ArrowLeftIcon className="size-3.5" />
            {backLabel}
          </button>
        )}
        <ScrollArea className="flex-1">
          {hasSelection ? detail : emptyDetail}
        </ScrollArea>
      </div>
    </div>
  )
}

/** Quiet placeholder for the detail pane when nothing is selected. */
export function DetailPlaceholder({ title, subline }: { title: string; subline: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-24 text-center">
      <h2 className="max-w-md font-sans text-xl font-medium tracking-tight text-balance text-foreground/40">
        {title}
      </h2>
      <p className="max-w-xs font-mono text-[13px] leading-relaxed text-muted-foreground">
        {subline}
      </p>
    </div>
  )
}
