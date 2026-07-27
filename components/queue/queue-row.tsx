'use client'

import {
  BanknoteIcon,
  CreditCardIcon,
  FileQuestionIcon,
  LandmarkIcon,
  ReceiptTextIcon,
  SparklesIcon,
  TimerIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shell/status-badge'
import { cn } from '@/lib/utils'
import type { WorkItem, WorkItemAction, WorkItemType } from '@/lib/types'

const typeIcons: Record<WorkItemType, typeof BanknoteIcon> = {
  pay_cycle: BanknoteIcon,
  bank_match: LandmarkIcon,
  overage: TimerIcon,
  invoice_variance: ReceiptTextIcon,
  card_statement: CreditCardIcon,
  missing_contract: FileQuestionIcon,
}

interface QueueRowProps {
  item: WorkItem
  selected: boolean
  exiting: boolean
  onOpen: () => void
  onAction: (action: WorkItemAction) => void
}

/** Dumb row: props in, events out. No business rules, no money math. */
export function QueueRow({ item, selected, exiting, onOpen, onAction }: QueueRowProps) {
  const Icon = typeIcons[item.type]

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.title} — open details`}
      data-selected={selected || undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'group flex w-full cursor-pointer items-start gap-4 border-b border-border px-5 py-4 text-left transition-all duration-250 ease-out outline-none',
        'hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset',
        selected && 'bg-accent/60',
        exiting && 'pointer-events-none translate-x-4 opacity-0',
      )}
    >
      {/* Selection indicator */}
      <span
        aria-hidden
        className={cn(
          'mt-1 h-8 w-0.5 shrink-0 rounded-full transition-colors duration-150',
          selected ? 'bg-ring' : 'bg-transparent',
        )}
      />

      <Icon className="mt-1 size-4 shrink-0 text-muted-foreground" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <h3 className="truncate text-sm font-medium text-foreground">
            {item.title}
          </h3>
          {item.amount && (
            <span className="ml-auto shrink-0 font-mono text-sm tabular-nums text-foreground">
              {item.amount.display}
            </span>
          )}
        </div>

        <p className="truncate text-[13px] text-muted-foreground">
          {item.meta.join(' · ')}
        </p>

        {item.trace && (
          <p className="mt-0.5 truncate font-mono text-xs tabular-nums text-muted-foreground">
            {item.trace}
          </p>
        )}

        {item.aiSuggestion && (
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-suggestion">
            <SparklesIcon className="size-3 shrink-0" />
            <span className="font-mono tabular-nums">
              {item.aiSuggestion.confidenceDisplay}
            </span>
            <span className="truncate text-muted-foreground">
              {item.aiSuggestion.summary}
            </span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-0.5">
        <StatusBadge status={item.status} />
        <div className="flex items-center gap-1.5">
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
              onClick={(e) => {
                e.stopPropagation()
                onAction(action)
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
