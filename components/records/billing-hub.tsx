'use client'

import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, LifecycleChip, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import type { Client, Invoice } from '@/lib/types'
import type { PaymentDisplay } from '@/lib/fixtures/records/billing'

const invoiceGrid = 'grid-cols-[110px_minmax(140px,1.2fr)_minmax(200px,2fr)_120px_80px_110px]'
const paymentGrid = 'grid-cols-[110px_120px_minmax(140px,1fr)_minmax(240px,2fr)]'

export function BillingHub({
  invoices,
  payments,
  clients,
}: {
  invoices: Invoice[]
  payments: PaymentDisplay[]
  clients: Client[]
}) {
  if (invoices.length === 0) {
    return (
      <RecordsEmpty
        title="Nothing billed yet."
        subline="Invoices and the payments that settle them appear here, linked line by line to bank rows."
      />
    )
  }

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? id

  return (
    <section aria-label="Billing">
      <HubHeader title="Invoices" count={invoices.length} countNoun="invoice" />
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
          <div
            role="listitem"
            key={invoice.id}
            className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${invoiceGrid}`}
          >
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

      <HubHeader title="Payments received" count={payments.length} countNoun="payment" />
      {payments.length === 0 ? (
        <p className="text-meta border-b border-border px-5 pb-6">
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
              <div
                role="listitem"
                key={payment.id}
                className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${paymentGrid}`}
              >
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {payment.receivedAt}
                </span>
                <RecordHover recordId={payment.id} className="justify-end">
                  <span className="text-prepared text-right font-mono text-sm tabular-nums">
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
    </section>
  )
}
