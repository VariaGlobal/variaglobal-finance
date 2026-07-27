'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { HealthDot, MiniToggle } from '@/components/settings/settings-bits'
import { integrations, type Integration } from '@/lib/fixtures/settings'
import { cn } from '@/lib/utils'

const healthTone = { healthy: 'ok', degraded: 'warn', down: 'down' } as const

export function IntegrationsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.id} integration={integration} />
      ))}
    </div>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [paused, setPaused] = useState(integration.paused)
  const rotationDue = integration.rotateAfterDays - integration.credentialAgeDays
  const rotateSoon = rotationDue <= 7

  return (
    <article className="flex flex-col rounded-lg border border-border">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-title flex items-center gap-2 font-medium text-foreground">
            <HealthDot tone={healthTone[integration.health]} />
            {integration.name}
            {paused && (
              <span className="font-mono text-[11px] font-normal text-held">
                paused
              </span>
            )}
          </h3>
          <p className="text-meta truncate">{integration.scope}</p>
        </div>
        <MiniToggle
          on={!paused}
          onLabel="Live"
          offLabel="Paused"
          ariaLabel={`${integration.name} sync ${paused ? 'paused' : 'live'}`}
          onToggle={() => {
            setPaused((p) => !p)
            toast(`${integration.name} ${paused ? 'resumed' : 'paused'}`, {
              description: 'Fixture only — no live connection this phase.',
            })
          }}
        />
      </header>

      <p className="text-meta px-4 pb-3">{integration.healthNote}</p>

      <dl className="flex flex-col border-t border-border">
        <MetricRow
          label="Credential age"
          value={`${integration.credentialAgeDays}d of ${integration.rotateAfterDays}d`}
          note={
            rotateSoon
              ? `rotate within ${rotationDue}d`
              : `rotation in ${rotationDue}d`
          }
          warn={rotateSoon}
        />
        <MetricRow
          label="Last sync"
          value={integration.lastSync}
          note={`${integration.recordsIngested.toLocaleString('en-US')} records ingested`}
        />
        <MetricRow
          label="Webhook heartbeat"
          value={integration.webhookHeartbeat}
        />
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
        <span className="font-mono text-xs tabular-nums text-foreground">
          {value}
        </span>
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
