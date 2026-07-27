'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GroupLabel } from '@/components/settings/settings-bits'
import { ruleTables, type RuleTable } from '@/lib/fixtures/settings'

export function RulesTab() {
  return (
    <div className="flex flex-col gap-10">
      <p className="text-meta max-w-prose">
        Rates and terms are effective-dated records, never inline-editable.
        Changes travel a proposal flow: Sydney proposes a diff, Ani confirms it.
      </p>
      {ruleTables.map((table) => (
        <RuleTableSection key={table.id} table={table} />
      ))}
    </div>
  )
}

type ProposalStep = 'diff' | 'proposed'

function RuleTableSection({ table }: { table: RuleTable }) {
  const [editOpen, setEditOpen] = useState(false)
  const [step, setStep] = useState<ProposalStep>('diff')
  // Sample diff for the mock proposal flow: first open-ended row, +5%.
  const sampleRow = table.rows.find((r) => r.effectiveTo === null) ?? table.rows[0]

  return (
    <section aria-label={table.title} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <GroupLabel>{table.title}</GroupLabel>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
            {table.rows.length} rows
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setStep('diff')
            setEditOpen(true)
          }}
        >
          Edit
        </Button>
      </div>

      {table.pending && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-l-2 border-decision/50 pl-3 py-1">
          <p className="text-[13px] text-foreground">
            {table.pending.proposedBy} proposes{' '}
            <span className="font-medium">{table.pending.change.rowSubject}</span>{' '}
            {table.pending.change.field}{' '}
            <span className="font-mono text-xs tabular-nums text-muted-foreground line-through">
              {table.pending.change.from}
            </span>{' '}
            <span className="font-mono text-xs tabular-nums">
              {table.pending.change.to}
            </span>
          </p>
          <p className="text-meta">
            {table.pending.proposedAt} · awaiting {table.pending.awaiting}
          </p>
        </div>
      )}

      <table className="w-full border-t border-border text-left">
        <thead>
          <tr className="border-b border-border">
            <Th>Subject</Th>
            <Th className="text-right">Rate</Th>
            <Th className="hidden sm:table-cell">Basis</Th>
            <Th>Effective from</Th>
            <Th>Effective to</Th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.id} className="border-b border-border">
              <td className="py-2.5 pr-3 text-[13px] text-foreground">
                {row.subject}
              </td>
              <td className="py-2.5 pr-3 text-right font-mono text-[13px] tabular-nums text-foreground">
                {row.rate}
              </td>
              <td className="text-meta hidden py-2.5 pr-3 sm:table-cell">
                {row.basis}
              </td>
              <td className="py-2.5 pr-3 font-mono text-xs tabular-nums text-muted-foreground">
                {row.effectiveFrom}
              </td>
              <td className="py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                {row.effectiveTo ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-title font-semibold tracking-tight">
              {step === 'diff'
                ? `Propose a change · ${table.title}`
                : 'Proposal recorded'}
            </DialogTitle>
            <DialogDescription className="text-meta">
              {step === 'diff'
                ? 'Rules are never edited in place. Review the diff, then propose.'
                : `Sydney proposed · Jul 27, 2026 · awaiting Ani`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col border-t border-border">
            <DiffLine label="Subject" value={sampleRow.subject} />
            <DiffLine
              label={table.kind === 'rate-card' ? 'Rate' : 'Terms'}
              from={sampleRow.rate}
              value={bumpRate(sampleRow.rate)}
            />
            <DiffLine label="Effective from" from={sampleRow.effectiveFrom} value="Aug 1, 2026" />
          </div>

          <DialogFooter>
            <Button size="sm" variant="ghost" onClick={() => setEditOpen(false)}>
              {step === 'diff' ? 'Cancel' : 'Close'}
            </Button>
            {step === 'diff' ? (
              <Button size="sm" onClick={() => setStep('proposed')}>
                Sydney proposes
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditOpen(false)
                  toast('Confirmation is Ani\u2019s move', {
                    description:
                      'The proposal stays pending until Ani confirms it from the Queue.',
                  })
                }}
              >
                Ani confirms
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/** Mock +5% bump for the sample diff so the flow reads with real numbers. */
function bumpRate(rate: string): string {
  const match = rate.match(/^\$([\d,]+\.\d{2})(.*)$/)
  if (!match) return rate
  const amount = Number(match[1].replace(/,/g, '')) * 1.05
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${match[2]}`
}

function DiffLine({
  label,
  from,
  value,
}: {
  label: string
  from?: string
  value: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
      <span className="text-meta shrink-0">{label}</span>
      <span className="flex min-w-0 items-baseline gap-2 text-right">
        {from && (
          <span className="font-mono text-xs tabular-nums text-muted-foreground line-through">
            {from}
          </span>
        )}
        <span className="font-mono text-[13px] tabular-nums text-foreground">
          {value}
        </span>
      </span>
    </div>
  )
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={`text-meta py-2 pr-3 text-xs font-normal last:pr-0 ${className ?? ''}`}
    >
      {children}
    </th>
  )
}
