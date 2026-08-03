'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { HealthDot, MiniToggle } from '@/components/settings/settings-bits'
import { SampleDataChip } from '@/components/records/records-bits'
import { Skeleton } from '@/components/ui/skeleton'
import { useSyncHealth, type SyncSourceView } from '@/lib/records-api/resources'
import { cn } from '@/lib/utils'

const healthTone = { healthy: 'ok', degraded: 'warn', down: 'down' } as const

/**
 * Integrations — driven by GET /api/records/sync-health. Cards show live
 * sync health per source; when the endpoint is unavailable we render bundled
 * sample sources, badged with the sample-data chip.
 */
export function IntegrationsTab() {
  const { data: sources, source, loading } = useSyncHealth()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">Sync health</h2>
        <SampleDataChip source={source} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <IntegrationSkeleton key={i} />)
          : sources.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
      </div>
    </div>
  )
}

function IntegrationSkeleton() {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-36" />
    </article>
  )
}

function IntegrationCard({ integration }: { integration: SyncSourceView }) {
  const [paused, setPaused] = useState(integration.paused)

  return (
    <article className="flex flex-col rounded-lg border border-border">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-title flex items-center gap-2 font-medium text-foreground">
            <HealthDot tone={healthTone[integration.health]} />
            {integration.name}
            {paused && <span className="font-mono text-[11px] font-normal text-held">paused</span>}
          </h3>
          <p className="text-meta truncate">{integration.scope}</p>
        </div>
        <MiniToggle
          on={!paused}
          onLabel="Syncing"
          offLabel="Paused"
          ariaLabel={`${integration.name} sync ${paused ? 'paused' : 'live'}`}
          onToggle={() => {
            setPaused((p) => !p)
            toast(`${integration.name} ${paused ? 'resumed' : 'paused'}`, {
              description: 'Control plane ships post-handoff — no live pause yet.',
            })
          }}
        />
      </header>

      <p className="text-meta px-4 pb-3">{integration.healthNote}</p>

      <dl className="flex flex-col border-t border-border">
        <MetricRow
          label="Last sync"
          value={integration.lastSync}
          note={`${integration.recordsIngested.toLocaleString('en-US')} records ingested`}
        />
        <MetricRow label="Webhook heartbeat" value={integration.webhookHeartbeat} />
      </dl>

      <footer className="flex items-center justify-end gap-1.5 border-t border-border px-4 py-2.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            toast(`Backfill queued for ${integration.name}`, {
              description: 'Fixture only — the backfill runner ships post-handoff.',
            })
          }
        >
          Backfill
        </Button>
      </footer>
    </article>
  )
}

function MetricRow({
  label,
  value,
  note,
  warn,
}: {
  label: string
  value: string
  note?: string
  warn?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-2 last:border-b-0">
      <dt className="text-meta shrink-0">{label}</dt>
      <dd className="flex min-w-0 items-baseline gap-2 text-right">
        <span className="font-mono text-xs tabular-nums text-foreground">{value}</span>
        {note && (
          <span
            className={cn(
              'truncate font-mono text-[11px] tabular-nums',
              warn ? 'text-decision' : 'text-muted-foreground/70',
            )}
          >
            {note}
          </span>
        )}
      </dd>
    </div>
  )
}
