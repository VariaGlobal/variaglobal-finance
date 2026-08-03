'use client'

import { RecordHover } from '@/components/records/record-hover'
import {
  HubBody,
  HubCanvas,
  HubHeader,
  LifecycleChip,
  PageHeader,
  RecordsEmpty,
  TableHead,
  moneyHubSubtitles,
  rowClass,
} from '@/components/records/records-bits'
import type { Counterparty, Invoice } from '@/lib/types'
import type { PaymentDisplay } from '@/lib/fixtures/records/billing'

const invoiceGrid = 'grid-cols-[110px_minmax(140px,1.2fr)_minmax(200px,2fr)_120px_80px_110px]'
const paymentGrid = 'grid-cols-[110px_120px_minmax(140px,1fr)_minmax(240px,2fr)]'

export function BillingHub({
  invoices,
  payments,
  counterparties,
  action,
}: {
  invoices: Invoice[]
  payments: PaymentDisplay[]
  counterparties: Counterparty[]
  action?: React.ReactNode
}) {
  if (invoices.length === 0) {
    return (
      <HubCanvas>
        <RecordsEmpty
          title="Nothing billed yet."
          subline="Invoices and the payments that settle them appear here, linked line by line to bank rows."
        />
      </HubCanvas>
    )
  }

  const clientName = (id: string) => counterparties.find((c) => c.id === id)?.name ?? id

  return (
    <HubCanvas>
      <section aria-label="Billing" className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Billing"
          eyebrow={`Money · ${moneyHubSubtitles.billing}`}
          count={invoices.length}
          countNoun="invoice"
          description="Invoices and the payments that settle them, linked line by line to bank rows. Sample data until invoices land in the database."
          source="fallback"
          action={action}
        />

        <HubBody>
          <div>
          <TableHead
            gridClassName={invoiceGrid}
            columns={[
              { label: 'Number' },
              { label: 'Client' },
              { label: 'Lines' },
              { label: 'Total', align: 'right' },
              { label: 'Due' },
              { label: 'Status' },
            ]}
          />
          <div role="list">
            {invoices.map((invoice) => (
              <div role="listitem" key={invoice.id} className={rowClass(invoiceGrid, true)}>
                <RecordHover recordId={invoice.id}>
                  <span className="font-mono text-sm tabular-nums text-foreground">
                    {invoice.number}
                  </span>
                </RecordHover>
                <RecordHover recordId={invoice.clientId}>
                  <span className="text-meta truncate">{clientName(invoice.clientId)}</span>
                </RecordHover>
                <span className="text-meta truncate">
                  {invoice.lines.map((l) => l.description).join(' · ')}
                </span>
                <span className="text-right font-mono text-sm tabular-nums text-foreground">
                  {invoice.total.display}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {invoice.dueAt ?? '—'}
                </span>
                <LifecycleChip status={invoice.status} />
              </div>
            ))}
          </div>
        </div>

          <div className="mt-6 border-t border-border">
            <HubHeader title="Payments received" count={payments.length} countNoun="payment" />
          {payments.length === 0 ? (
            <p className="text-meta px-5 pb-6 md:px-7">
              No payments received for this entity yet.
            </p>
          ) : (
            <>
              <TableHead
                gridClassName={paymentGrid}
                columns={[
                  { label: 'Received' },
                  { label: 'Amount', align: 'right' },
                  { label: 'Invoice' },
                  { label: 'Bank row' },
                ]}
              />
              <div role="list">
                {payments.map((payment) => (
                  <div role="listitem" key={payment.id} className={rowClass(paymentGrid)}>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {payment.receivedAt}
                    </span>
                    <RecordHover recordId={payment.id} className="justify-end">
                      <span className="text-right font-mono text-sm tabular-nums text-prepared">
                        {payment.amount.display}
                      </span>
                    </RecordHover>
                    {payment.invoiceId ? (
                      <RecordHover recordId={payment.invoiceId}>
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {payment.invoiceNumber}
                        </span>
                      </RecordHover>
                    ) : (
                      <span className="text-meta">unapplied</span>
                    )}
                    <span className="text-meta truncate">
                      {payment.bankRowLabel ?? '—'}
                      <span className="ml-2 text-muted-foreground/60">{payment.method}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </HubBody>
      </section>
    </HubCanvas>
  )
}
