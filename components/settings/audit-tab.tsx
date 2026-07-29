'use client'

import { GroupLabel } from '@/components/settings/settings-bits'
import { auditRows } from '@/lib/fixtures/settings'

/** 08 Audit — read-only trail. Every state change, attributed. Fixtures. */
export function AuditTab() {
  return (
    <div className="flex max-w-4xl flex-col gap-3">
      <GroupLabel>Audit trail</GroupLabel>
      <ul className="flex flex-col border-t border-border">
        {auditRows.map((row) => (
          <li
            key={row.id}
            className="flex flex-col gap-1 border-b border-border py-3"
          >
            <div className="flex items-baseline gap-3">
              <span className="w-28 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                {row.at}
              </span>
              <p className="min-w-0 flex-1 text-sm text-foreground">
                <span className="font-medium">{row.actor}</span> {row.action}
              </p>
            </div>
            <div className="flex items-baseline gap-3 pl-31">
              <p className="text-meta min-w-0 flex-1">{row.object}</p>
            </div>
            {(row.before || row.after) && (
              <div className="flex items-baseline gap-3 pl-31">
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {row.before ? `${row.before} → ` : ''}
                  <span className="text-foreground">{row.after}</span>
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="text-meta">
        Read-only. The audit trail is retained indefinitely and cannot be
        edited from any surface.
      </p>
    </div>
  )
}
