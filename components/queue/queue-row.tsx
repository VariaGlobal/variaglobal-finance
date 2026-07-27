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

/** 28px icon tile tinted by item type at 8% opacity. */
const typeTint: Record<WorkItemType, string> = {
  pay_cycle: 'bg-prepared/8 text-prepared',
  bank_match: 'bg-suggestion/8 text-suggestion',
  overage: 'bg-decision/8 text-decision',
  invoice_variance: 'bg-variance/8 text-variance',
  card_statement: 'bg-foreground/8 text-muted-foreground',
  missing_contract: 'bg-held/8 text-held',
}

export type QueueDensity = 'comfortable' | 'compact'

interface QueueRowProps {
  item: WorkItem
  selected: boolean
  exiting: boolean
  density: QueueDensity
  onOpen: () => void
  onAction: (action: WorkItemAction) => void
}

/** Dumb row: props in, events out. No business rules, no money math. */
export function QueueRow({
  item,
  selected,
  exiting,
  density,
  onOpen,
  onAction,
}: QueueRowProps) {
  const Icon = typeIcons[item.type]
  const compact = density === 'compact'
  const traceSegments = item.trace?.split(' · ') ?? []

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
        'group relative flex w-full cursor-pointer items-center gap-3 border-b border-border px-5 text-left transition-colors duration-150 outline-none',
        compact ? 'min-h-11 py-1.5' : 'min-h-14 py-2.5',
        // Keyboard selection behaves exactly like hover.
        'hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.03]',
        selected && 'bg-foreground/[0.03]',
        exiting && 'pointer-events-none opacity-0 transition-opacity duration-200',
      )}
    >
      {/* Selected: 2px left accent, not a background flood. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-0.5 transition-colors duration-150',
          selected ? 'bg-ring' : 'bg-transparent',
        )}
      />

      {/* Approve: 1px accent line sweeps left→right as the row leaves. */}
      {exiting && (
        <span
          aria-hidden
          className="animate-approve-sweep absolute inset-x-0 top-0 h-px bg-ring"
        />
      )}

      {/* Type icon in a 28px rounded square, tinted at 8% */}
      <span
        aria-hidden
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          typeTint[item.type],
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline gap-3">
          <h3 className="text-title truncate font-medium text-foreground">
            {item.title}
          </h3>
          {item.amount && (
            <span className="ml-auto shrink-0 font-mono text-sm tabular-nums text-foreground">
              {item.amount.display}
            </span>
          )}
        </div>

        {!compact && (
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-meta truncate">{item.meta.join(' · ')}</p>

            {/* Calculation trace: inline mono pills — receipts, not code. */}
            {traceSegments.map((segment) => (
              <span
                key={segment}
                className="hidden shrink-0 items-center rounded border border-border px-1.5 py-px font-mono text-xs tabular-nums text-muted-foreground md:inline-flex"
              >
                {segment}
              </span>
            ))}

            {item.aiSuggestion && (
              <span className="hidden shrink-0 items-center gap-1 text-xs text-suggestion lg:inline-flex">
                <SparklesIcon className="size-3" />
                <span className="font-mono tabular-nums">
                  {item.aiSuggestion.confidenceDisplay}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={item.status} />
        <div className="flex items-center gap-1.5">
          {item.actions.map((action) => {
            const isPrimary = action.intent === 'primary'
            return (
              <Button
                key={action.id}
                size="sm"
                tabIndex={-1}
                variant={
                  isPrimary
                    ? 'default'
                    : action.intent === 'destructive'
                      ? 'destructive'
                      : 'outline'
                }
                className={cn(
                  // Rest state shows only the primary; hover/selection reveal the rest.
                  !isPrimary &&
                    'pointer-events-none opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-visible:pointer-events-auto group-focus-visible:opacity-100 group-data-selected:pointer-events-auto group-data-selected:opacity-100',
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onAction(action)
                }}
              >
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
