/**
 * Shared Records primitives — the framed content canvas, page + hub headers,
 * hairline table scaffolding, editorial empty state, and lifecycle chips.
 * Dumb components: props in, nothing out.
 */

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DataSource } from '@/lib/records-api/types'

/** Horizontal padding used consistently across every hub's interior. */
export const hubPadX = 'px-5 md:px-7'

/**
 * The framed canvas every Records hub sits in — a warm card surface floating
 * on the page with a rounded hairline border and comfortable margin. This is
 * what gives the section its breathing room. No shadow (reserved for
 * overlays); elevation reads purely from the lighter card fill.
 */
export function HubCanvas({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-3 md:p-5">
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Scrolling body region for a hub — sits below a fixed PageHeader inside a
 * HubCanvas so the header stays put while line items scroll.
 */
export function HubBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto pt-4 pb-8', className)}>{children}</div>
  )
}

/**
 * "Sample data" chip — shown in a header whenever a hub is rendering bundled
 * fixtures instead of live API data. Mock data must never be mistaken for real
 * records, so this is deliberately conspicuous.
 */
export function SampleDataChip({ source }: { source: DataSource }) {
  if (source === 'live') return null
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-decision/30 bg-decision/10 font-normal text-decision"
      title="This hub is showing bundled sample data because the live API is unavailable."
    >
      <span aria-hidden className="size-1.5 rounded-full bg-decision" />
      sample data
    </Badge>
  )
}

/** Small mono count pill used in page + hub headers. */
export function CountPill({
  count,
  noun,
  nounPlural,
}: {
  count: number
  noun: string
  nounPlural?: string
}) {
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-full border border-border px-2.5 font-mono text-[11px] tabular-nums text-muted-foreground">
      {count} {count === 1 ? noun : (nounPlural ?? `${noun}s`)}
    </span>
  )
}

/**
 * Prominent page header for a full-width hub — large title, count pill, an
 * orienting one-liner, and a right-aligned action slot (e.g. Upload). Sits on
 * the card's top edge above the hairline that separates it from the table.
 */
export function PageHeader({
  title,
  eyebrow,
  count,
  countNoun,
  countNounPlural,
  description,
  source,
  action,
}: {
  title: string
  /** Small group/context label above the title, e.g. "Money · what we owe people". */
  eyebrow?: string
  count?: number
  countNoun?: string
  countNounPlural?: string
  description?: string
  source?: DataSource
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-4 border-b border-border pt-6 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6',
        hubPadX,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow && (
          <span className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
            {eyebrow}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="text-xl font-medium tracking-tight text-balance text-foreground md:text-2xl">
            {title}
          </h1>
          {typeof count === 'number' && countNoun && (
            <CountPill count={count} noun={countNoun} nounPlural={countNounPlural} />
          )}
          {source && <SampleDataChip source={source} />}
        </div>
        {description && (
          <p className="max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

/** Skeleton rows for a hairline table while a live fetch is in flight. */
export function TableSkeleton({
  gridClassName,
  rows = 6,
  cols,
}: {
  gridClassName: string
  rows?: number
  cols: number
}) {
  return (
    <div role="status" aria-label="Loading records" aria-live="polite">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={cn(
            'grid min-h-[52px] items-center gap-3 border-b border-border/60 py-3',
            hubPadX,
            gridClassName,
          )}
        >
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton
              key={c}
              className={cn('h-3.5', c === 0 ? 'w-2/3' : 'w-1/2', c > 0 && 'justify-self-end')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

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

/** Compact hub header: title · mono count · optional trailing content. */
export function HubHeader({
  title,
  count,
  countNoun,
  countNounPlural,
  source,
  children,
}: {
  title: string
  count: number
  countNoun: string
  /** Irregular plural, e.g. "counterparties". Defaults to countNoun + "s". */
  countNounPlural?: string
  /** When provided, renders the sample-data chip if source is 'fallback'. */
  source?: DataSource
  children?: React.ReactNode
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 pt-6 pb-4', hubPadX)}>
      <div className="flex items-center gap-3">
        <h2 className="text-base font-medium tracking-tight text-foreground">{title}</h2>
        <CountPill count={count} noun={countNoun} nounPlural={countNounPlural} />
        {source && <SampleDataChip source={source} />}
      </div>
      {children}
    </div>
  )
}

/** Column header row for hairline tables. */
export function TableHead({
  columns,
  gridClassName,
  padX = hubPadX,
}: {
  columns: { label: string; align?: 'right' }[]
  gridClassName: string
  /** Override the default hub horizontal padding (e.g. detail panes use px-6). */
  padX?: string
}) {
  return (
    <div
      className={cn(
        'grid items-baseline gap-3 border-b border-border pt-1 pb-2.5 text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase',
        padX,
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

/**
 * Consistent line-item row styling for hairline tables. `interactive` adds a
 * pointer + slightly stronger hover; pass a grid template via `gridClassName`.
 */
export function rowClass(gridClassName: string, interactive = false) {
  return cn(
    'group grid min-h-[52px] items-center gap-3 border-b border-border/60 py-3 transition-colors duration-150 last:border-b-0',
    hubPadX,
    interactive ? 'hover:bg-foreground/[0.045]' : 'hover:bg-foreground/[0.025]',
    gridClassName,
  )
}

/* ── Shared status vocabulary ────────────────────────────────────────��
 * ONE chip language across every hub: the same tone always means the same
 * thing, so a green chip reads "settled / good" whether it's a paid invoice,
 * a matched bank row, a signed NDA, or an active relationship — and never
 * anything else. Domain chips below are thin wrappers that map their status
 * onto one of these four tones. Roles and categories are a different axis and
 * deliberately stay outside this vocabulary.
 *
 *   positive  (green)  settled / good      paid · matched · signed · active
 *   pending   (blue)   in motion / awaited  to be paid · unmatched · sent
 *   attention (amber)  needs a human        missing · dormant · disputed
 *   neutral   (grey)   inactive / n-a       ended · void · draft · excluded
 */
export type StatusTone = 'positive' | 'pending' | 'attention' | 'neutral'

const statusToneClass: Record<StatusTone, string> = {
  positive: 'border-prepared/20 bg-prepared/10 text-prepared',
  pending: 'border-decision/20 bg-decision/10 text-decision',
  attention: 'border-held/20 bg-held/10 text-held',
  neutral: 'border-border bg-muted text-muted-foreground',
}

export function StatusChip({
  tone,
  children,
  title,
}: {
  tone: StatusTone
  children: React.ReactNode
  title?: string
}) {
  return (
    <Badge variant="outline" title={title} className={cn('font-normal', statusToneClass[tone])}>
      {children}
    </Badge>
  )
}

/** Invoice lifecycle → shared tone. */
const invoiceStatusTone: Record<string, StatusTone> = {
  draft: 'neutral',
  sent: 'pending',
  partially_paid: 'pending',
  paid: 'positive',
  disputed: 'attention',
  credit_note: 'neutral',
  void: 'neutral',
}

export function LifecycleChip({ status }: { status: string }) {
  return (
    <StatusChip tone={invoiceStatusTone[status] ?? 'neutral'}>
      {status.replace(/_/g, ' ')}
    </StatusChip>
  )
}

/** Matched / unmatched chip for bank rows. */
export function MatchedChip({ matched }: { matched: boolean }) {
  return (
    <StatusChip tone={matched ? 'positive' : 'pending'}>
      {matched ? 'matched' : 'unmatched'}
    </StatusChip>
  )
}

/** Relationship / contract lifecycle → shared tone. */
export function relationshipTone(status: string): StatusTone {
  if (status === 'active') return 'positive'
  if (status === 'dormant' || status === 'missing_terms') return 'attention'
  return 'neutral' // ended
}

/** Canonical one-line subtitles for the MONEY hubs — same phrasing everywhere. */
export const moneyHubSubtitles = {
  cycles: 'what we owe people for work',
  billing: 'invoices and payments — promises with outsiders',
  banking: 'what actually moved at the bank',
} as const
