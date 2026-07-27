'use client'

import { GroupLabel, HealthDot } from '@/components/settings/settings-bits'
import {
  approvalThresholds,
  entityRegistry,
  retentionRules,
} from '@/lib/fixtures/settings'

/** 07 Admin — entity registry, approval thresholds, retention. Fixtures. */
export function AdminTab() {
  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <section aria-label="Entity registry" className="flex flex-col gap-3">
        <GroupLabel>Entity registry</GroupLabel>
        <ul className="flex flex-col border-t border-border">
          {entityRegistry.map((entity) => (
            <li
              key={entity.id}
              className="flex items-baseline gap-3 border-b border-border py-3"
            >
              <HealthDot
                tone={entity.status === 'active' ? 'ok' : 'warn'}
                className="self-center"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-title font-medium text-foreground">
                  {entity.name}
                </p>
                <p className="text-meta">
                  {entity.kind} · {entity.accounts}
                </p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {entity.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Approval thresholds" className="flex flex-col gap-3">
        <GroupLabel>Approval thresholds</GroupLabel>
        <ul className="flex flex-col border-t border-border">
          {approvalThresholds.map((threshold) => (
            <li
              key={threshold.id}
              className="flex items-baseline gap-3 border-b border-border py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm text-foreground">{threshold.scope}</p>
                <p className="text-meta">{threshold.rule}</p>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                {threshold.approver}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-meta">
          Thresholds are configuration records — changes go through the same
          propose → confirm flow as Rules.
        </p>
      </section>

      <section aria-label="Data retention" className="flex flex-col gap-3">
        <GroupLabel>Data retention</GroupLabel>
        <ul className="flex flex-col border-t border-border">
          {retentionRules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-baseline gap-3 border-b border-border py-3"
            >
              <p className="min-w-0 flex-1 text-sm text-foreground">{rule.record}</p>
              <span className="text-meta shrink-0">{rule.policy}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
