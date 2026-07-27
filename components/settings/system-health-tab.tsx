'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  GroupLabel,
  HealthDot,
  MiniToggle,
} from '@/components/settings/settings-bits'
import { backups, stalenessRules } from '@/lib/fixtures/settings'

export function SystemHealthTab() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-label="Backups" className="flex flex-col gap-3">
        <GroupLabel>Backups</GroupLabel>
        <ul className="flex flex-col border-t border-border">
          {backups.map((backup) => (
            <li
              key={backup.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border py-3"
            >
              <HealthDot
                tone={backup.status === 'ok' ? 'ok' : 'warn'}
                className="self-center"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <h3 className="text-title font-medium text-foreground">
                  {backup.name}
                </h3>
                <p className="text-meta">{backup.detail}</p>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {backup.lastPoint}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Staleness alerts" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <GroupLabel>Staleness alerts</GroupLabel>
          <span className="text-meta">
            alert when a source stops delivering
          </span>
        </div>
        <ul className="flex flex-col border-t border-border">
          {stalenessRules.map((rule) => (
            <StalenessRow
              key={rule.id}
              source={rule.source}
              threshold={rule.threshold}
              notify={rule.notify}
              initialEnabled={rule.enabled}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}

function StalenessRow({
  source,
  threshold,
  notify,
  initialEnabled,
}: {
  source: string
  threshold: string
  notify: string
  initialEnabled: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border py-2.5">
      <span className="min-w-40 flex-1 text-[13px] text-foreground">{source}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {threshold}
      </span>
      <span className="text-meta hidden sm:block">notifies {notify}</span>
      <MiniToggle
        on={enabled}
        ariaLabel={`Staleness alert for ${source}`}
        onToggle={() => {
          setEnabled((e) => !e)
          toast(`Alert ${enabled ? 'disabled' : 'enabled'} for ${source}`, {
            description: 'Fixture only — alerting wires up post-handoff.',
          })
        }}
      />
    </li>
  )
}
