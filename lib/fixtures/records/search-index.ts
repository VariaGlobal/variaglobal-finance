/**
 * Global smart search index — every record across all hubs, flattened
 * into searchable entries. Built once at module load from fixtures.
 * Multi-token AND matching: "arsalan june" surfaces his cycle lines,
 * payment, and ruling.
 */

import { bankTransactions } from '@/lib/fixtures/records/banking'
import { invoices, payments } from '@/lib/fixtures/records/billing'
import { cycles } from '@/lib/fixtures/records/cycles'
import { documents } from '@/lib/fixtures/records/documents'
import { recordPeople } from '@/lib/fixtures/records/people'
import { counterparties } from '@/lib/fixtures/counterparties'
import { entityName } from '@/lib/fixtures/workspace'
import { realCycleSpecs } from '@/lib/fixtures/real-cycles'

export interface SearchEntry {
  /** Unique entry id (may differ from summaryId for line-level entries). */
  id: string
  /** Record id used for the hover card. */
  summaryId: string
  hub: 'People' | 'Counterparties' | 'Pay cycles' | 'Banking' | 'Billing' | 'Documents'
  title: string
  /** Muted detail rendered after the title. */
  detail?: string
  /** Lowercase haystack for token matching. */
  keywords: string
  /** Where selecting the result lands: records tab + record to open. */
  target: { tab: string; openId?: string }
}

const MONTH_WORDS: Record<string, string> = {
  Jan: 'jan january',
  Feb: 'feb february',
  Mar: 'mar march',
  Apr: 'apr april',
  May: 'may',
  Jun: 'jun june',
  Jul: 'jul july',
  Aug: 'aug august',
  Sep: 'sep september',
  Oct: 'oct october',
  Nov: 'nov november',
  Dec: 'dec december',
}

/** Expand month abbreviations found in a label into full-word keywords. */
function monthWords(text: string): string {
  return Object.entries(MONTH_WORDS)
    .filter(([abbr]) => text.includes(abbr))
    .map(([, words]) => words)
    .join(' ')
}

function hay(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ').toLowerCase()
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = []

  /* People */
  for (const person of recordPeople) {
    const rate = person.rateHistory[person.rateHistory.length - 1]
    entries.push({
      id: `person-${person.id}`,
      summaryId: person.id,
      hub: 'People',
      title: person.name,
      detail: person.role,
      keywords: hay(person.name, person.role, rate?.rateDisplay, person.routing.routedVia),
      target: { tab: 'people', openId: person.id },
    })
  }

  /* Counterparties — searchable by name, alias, role, entity, and stream */
  for (const cp of counterparties) {
    const contractText = cp.contracts
      .flatMap((c) => [c.name, ...c.terms.map((t) => t.summary), ...c.rules.map((r) => r.label)])
      .join(' ')
    const relationshipText = cp.relationships
      .map((r) => `${r.role} ${entityName(r.entity)} ${r.streamType}`)
      .join(' ')
    entries.push({
      id: `counterparty-${cp.id}`,
      summaryId: cp.id,
      hub: 'Counterparties',
      title: cp.name,
      detail: cp.roles.join(' · '),
      keywords: hay(
        cp.name,
        cp.aliases?.join(' '),
        cp.roles.join(' '),
        relationshipText,
        contractText,
        'counterparty',
      ),
      target: { tab: 'counterparties', openId: cp.id },
    })
  }

  /* Pay cycles + their lines */
  for (const cycle of cycles) {
    entries.push({
      id: `cycle-${cycle.id}`,
      summaryId: cycle.id,
      hub: 'Pay cycles',
      title: `Pay cycle ${cycle.periodLabel}`,
      detail: `${cycle.payableDisplay} · ${cycle.statusLabel.toLowerCase()}`,
      keywords: hay(
        cycle.periodLabel,
        cycle.monthLabel,
        monthWords(cycle.periodLabel),
        cycle.statusLabel,
        cycle.payableDisplay,
        'pay cycle payroll',
      ),
      target: { tab: 'cycles', openId: cycle.id },
    })
    for (const line of cycle.lines) {
      entries.push({
        id: `line-${line.id}`,
        summaryId: line.personId,
        hub: 'Pay cycles',
        title: `${line.personName} · ${cycle.periodLabel}`,
        detail:
          line.amountDisplay !== '—'
            ? `${line.hoursDisplay} · ${line.amountDisplay}`
            : (line.stateLabel ?? line.hoursDisplay),
        keywords: hay(
          line.personName,
          cycle.periodLabel,
          monthWords(cycle.periodLabel),
          monthWords(line.originPeriodLabel),
          line.originPeriodLabel,
          line.hoursDisplay,
          line.amountDisplay,
          line.stateLabel,
          line.notes.join(' '),
          'cycle line ruling',
        ),
        target: { tab: 'cycles', openId: cycle.id },
      })
    }
  }

  /* Rulings — deferrals, open questions, and backfills on the cycles */
  for (const spec of realCycleSpecs) {
    const cycle = cycles.find((c) => c.id === spec.id)
    for (const instruction of spec.instructions ?? []) {
      if (!instruction.id.startsWith('RUL')) continue
      entries.push({
        id: `ruling-${instruction.id}`,
        summaryId: instruction.id,
        hub: 'Pay cycles',
        title: `${instruction.id} · ${'person' in instruction ? instruction.person : ''}`.trim(),
        detail: instruction.label,
        keywords: hay(
          instruction.id,
          'person' in instruction ? instruction.person : undefined,
          instruction.label,
          cycle?.periodLabel,
          cycle ? monthWords(cycle.periodLabel) : undefined,
          'ruling decision',
        ),
        target: { tab: 'cycles', openId: spec.id },
      })
    }
  }

  /* Banking */
  for (const txn of bankTransactions) {
    entries.push({
      id: `bank-${txn.id}`,
      summaryId: txn.id,
      hub: 'Banking',
      title: txn.description,
      detail: `${txn.amount.display} · posted ${txn.postedAt}`,
      keywords: hay(
        txn.description,
        txn.account,
        txn.amount.display,
        txn.postedAt,
        monthWords(txn.postedAt),
        txn.matched ? 'matched' : 'unmatched',
        'bank transaction payment',
      ),
      target: { tab: 'banking' },
    })
  }

  /* Billing — invoices + payments */
  for (const invoice of invoices) {
    const client = counterparties.find((c) => c.id === invoice.clientId)
    entries.push({
      id: `invoice-${invoice.id}`,
      summaryId: invoice.id,
      hub: 'Billing',
      title: invoice.number,
      detail: `${client?.name ?? invoice.clientId} · ${invoice.total.display}`,
      keywords: hay(
        invoice.number,
        client?.name,
        invoice.status,
        invoice.total.display,
        invoice.lines.map((l) => l.description).join(' '),
        monthWords(invoice.issuedAt),
        'invoice',
      ),
      target: { tab: 'billing' },
    })
  }
  for (const payment of payments) {
    entries.push({
      id: `payment-${payment.id}`,
      summaryId: payment.id,
      hub: 'Billing',
      title: `${payment.amount.display} received`,
      detail: `${payment.invoiceNumber ?? 'unapplied'} · ${payment.receivedAt}`,
      keywords: hay(
        payment.amount.display,
        payment.invoiceNumber,
        payment.bankRowLabel,
        payment.method,
        payment.receivedAt,
        monthWords(payment.receivedAt),
        'payment received',
      ),
      target: { tab: 'billing' },
    })
  }

  /* Documents */
  for (const doc of documents) {
    entries.push({
      id: `doc-${doc.id}`,
      summaryId: doc.id,
      hub: 'Documents',
      title: doc.name,
      detail: `${doc.kind} · uploaded ${doc.uploadedAt}`,
      keywords: hay(doc.name, doc.kind, doc.uploadedAt, monthWords(doc.uploadedAt), 'document'),
      target: { tab: 'documents', openId: doc.id },
    })
  }

  return entries
}

export const searchIndex: SearchEntry[] = buildIndex()

const HUB_ORDER: SearchEntry['hub'][] = [
  'People',
  'Counterparties',
  'Pay cycles',
  'Banking',
  'Billing',
  'Documents',
]

export interface SearchGroup {
  hub: SearchEntry['hub']
  entries: SearchEntry[]
}

/** Multi-token AND match: every query token must appear in the haystack. */
export function searchRecords(query: string): SearchGroup[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const matched = searchIndex.filter((entry) => {
    const haystack = `${entry.title.toLowerCase()} ${entry.keywords}`
    return tokens.every((token) => haystack.includes(token))
  })

  return HUB_ORDER.map((hub) => ({
    hub,
    entries: matched.filter((e) => e.hub === hub).slice(0, 6),
  })).filter((group) => group.entries.length > 0)
}
