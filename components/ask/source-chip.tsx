'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeftRightIcon,
  BuildingIcon,
  CalendarClockIcon,
  UserIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AskSource, AskSourceType } from '@/lib/ask/types'

/** Each source type maps to a Records hub + deep-link target. */
const SOURCE_META: Record<
  AskSourceType,
  { icon: LucideIcon; tab: string; supportsOpen: boolean; noun: string }
> = {
  counterparty: { icon: BuildingIcon, tab: 'counterparties', supportsOpen: true, noun: 'counterparty' },
  cycle: { icon: CalendarClockIcon, tab: 'cycles', supportsOpen: true, noun: 'pay cycle' },
  person: { icon: UserIcon, tab: 'people', supportsOpen: true, noun: 'person' },
  // Banking has no single-row deep link yet; land on the hub.
  transaction: { icon: ArrowLeftRightIcon, tab: 'banking', supportsOpen: false, noun: 'transaction' },
}

export function SourceChip({
  source,
  onNavigate,
}: {
  source: AskSource
  /** Called just before navigation (e.g. to close the panel on mobile). */
  onNavigate?: () => void
}) {
  const router = useRouter()
  const meta = SOURCE_META[source.type]
  const Icon = meta.icon

  function open() {
    onNavigate?.()
    const params = new URLSearchParams({ tab: meta.tab })
    if (meta.supportsOpen) params.set('open', source.id)
    router.push(`/records?${params.toString()}`)
  }

  return (
    <button
      type="button"
      onClick={open}
      title={`Open ${meta.noun} in Records`}
      className={cn(
        'group inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card py-1 pr-2.5 pl-2 text-xs text-foreground',
        'transition-colors duration-150 hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
    >
      <Icon aria-hidden className="size-3 shrink-0 text-muted-foreground" />
      <span className="truncate">{source.label}</span>
    </button>
  )
}
