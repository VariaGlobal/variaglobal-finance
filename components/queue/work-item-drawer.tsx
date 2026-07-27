'use client'

import { SparklesIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shell/status-badge'
import { cn } from '@/lib/utils'
import type { WorkItem, WorkItemAction } from '@/lib/types'

interface WorkItemDrawerProps {
  item: WorkItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAction: (action: WorkItemAction) => void
}

/** Linear-style right-side detail drawer: evidence, full trace, history. */
export function WorkItemDrawer({ item, open, onOpenChange, onAction }: WorkItemDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-hidden data-[side=right]:sm:max-w-md"
      >
        {item && (
          <div className="animate-drawer-content flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SheetHeader className="gap-2 pb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-muted-foreground">
                  {item.createdAt}
                </span>
              </div>
              <SheetTitle className="text-title leading-snug text-pretty">
                {item.title}
              </SheetTitle>
              <SheetDescription className="text-meta">
                {item.meta.join(' · ')}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-4">
              {/* Calculation trace — a receipt line, not a code block */}
              {item.trace && (
                <section aria-label="Calculation trace">
                  <h4 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Trace
                  </h4>
                  <p className="border-t border-b border-border py-2.5 font-mono text-xs leading-relaxed tabular-nums text-foreground">
                    {item.trace}
                  </p>
                </section>
              )}

              {/* AI suggestion — state-bearing accent, no box */}
              {item.aiSuggestion && (
                <section aria-label="AI suggestion">
                  <h4 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Suggestion
                  </h4>
                  <div className="flex flex-col gap-1 border-l-2 border-suggestion/40 pl-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-suggestion">
                      <SparklesIcon className="size-3" />
                      <span className="font-mono tabular-nums">
                        {item.aiSuggestion.confidenceDisplay} confidence
                      </span>
                    </p>
                    <p className="font-mono text-xs leading-relaxed tabular-nums text-foreground">
                      {item.aiSuggestion.summary}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.aiSuggestion.source}
                    </p>
                  </div>
                </section>
              )}

              {/* Evidence panel */}
              <section aria-label="Evidence">
                <h4 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Evidence
                </h4>
                <dl className="flex flex-col">
                  {item.evidence.map((row, i) => (
                    <div
                      key={row.label}
                      className={cn(
                        'flex items-baseline justify-between gap-4 py-2',
                        i > 0 && 'border-t border-border/60',
                      )}
                    >
                      <dt className="shrink-0 text-xs text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd
                        className={cn(
                          'text-right text-xs text-foreground',
                          row.mono && 'font-mono tabular-nums',
                        )}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <Separator />

              {/* Item history */}
              <section aria-label="History">
                <h4 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  History
                </h4>
                <ol className="flex flex-col gap-3">
                  {item.history.map((event, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40"
                      />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs leading-relaxed text-foreground">
                          {event.event}
                        </p>
                        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                          {event.at} · {event.actor}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border">
              {item.actions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant={
                    action.intent === 'primary'
                      ? 'default'
                      : action.intent === 'destructive'
                        ? 'destructive'
                        : 'outline'
                  }
                  onClick={() => onAction(action)}
                >
                  {action.label}
                </Button>
              ))}
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
