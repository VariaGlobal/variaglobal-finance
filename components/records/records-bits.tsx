/**
 * Shared Records primitives — editorial empty state, hairline table
 * scaffolding, and lifecycle chips. Dumb components: props in, nothing out.
 */

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

/** Editorial empty state — quiet oversized headline + mono subline. */
export function RecordsEmpty({ title, subline }: { title: string; subline: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <h2 className="max-w-2xl font-sans text-[clamp(24px,3.5vw,38px)] leading-[1.12] font-medium tracking-[-0.02em] text-balance text-foreground/30">
        {title}
      </h2>
      <p className="max-w-md font-mono text-[13px] leading-relaxed text-muted-foreground">
        {subline}
      </p>
    </div>
  )
}

/** Hub header: title · mono count · optional trailing content. */
export function HubHeader({
  title,
  count,
  countNoun,
  countNounPlural,
  children,
}: {
  title: string
  count: number
  countNoun: string
  /** Irregular plural, e.g. "counterparties". Defaults to countNoun + "s". */
  countNounPlural?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-medium tracking-tight text-foreground">{title}</h1>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {count} {count === 1 ? countNoun : (countNounPlural ?? `${countNoun}s`)}
        </span>
      </div>
      {children}
    </div>
  )
}

/** Column header row for hairline tables. */
export function TableHead({
  columns,
  gridClassName,
}: {
  columns: { label: string; align?: 'right' }[]
  gridClassName: string
}) {
  return (
    <div
      className={cn(
        'grid items-baseline gap-3 border-b border-border px-5 pb-2 text-[11px] tracking-wide text-muted-foreground/70 uppercase',
        gridClassName,
      )}
    >
      {columns.map((col) => (
        <span key={col.label} className={cn(col.align === 'right' && 'text-right')}>
          {col.label}
        </span>
      ))}
    </div>
  )
}

const lifecycleChip: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-suggestion/10 text-suggestion border-suggestion/20',
  partially_paid: 'bg-decision/10 text-decision border-decision/20',
  paid: 'bg-prepared/10 text-prepared border-prepared/20',
  disputed: 'bg-variance/10 text-variance border-variance/20',
  credit_note: 'bg-muted text-muted-foreground border-border',
  void: 'bg-held/10 text-held border-held/20',
}

export function LifecycleChip({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('font-normal', lifecycleChip[status] ?? lifecycleChip.draft)}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

/** Matched / unmatched chip for bank rows. */
export function MatchedChip({ matched }: { matched: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal',
        matched
          ? 'bg-prepared/10 text-prepared border-prepared/20'
          : 'bg-decision/10 text-decision border-decision/20',
      )}
    >
      {matched ? 'matched' : 'unmatched'}
    </Badge>
  )
}
