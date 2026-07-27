import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkItemStatus } from '@/lib/types'

const statusConfig: Record<WorkItemStatus, { label: string; className: string }> = {
  prepared: {
    label: 'prepared',
    className: 'bg-prepared/10 text-prepared border-prepared/20',
  },
  suggestion: {
    label: 'suggestion',
    className: 'bg-suggestion/10 text-suggestion border-suggestion/20',
  },
  needs_decision: {
    label: 'needs decision',
    className: 'bg-decision/10 text-decision border-decision/20',
  },
  variance: {
    label: 'variance',
    className: 'bg-variance/10 text-variance border-variance/20',
  },
  review: {
    label: 'review',
    className: 'bg-muted text-muted-foreground border-border',
  },
  held: {
    label: 'held',
    className: 'bg-held/10 text-held border-held/20',
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: WorkItemStatus
  className?: string
}) {
  const config = statusConfig[status]
  return (
    <Badge
      variant="outline"
      className={cn('font-normal', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
