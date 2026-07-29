'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { Person } from '@/lib/types'

const grid = 'grid-cols-[minmax(160px,1.4fr)_minmax(120px,1fr)_100px_minmax(140px,1fr)_130px]'

export function PeopleHub({
  people,
  highlightedId,
  onOpenPerson,
}: {
  people: Person[]
  highlightedId?: string | null
  onOpenPerson: (personId: string) => void
}) {
  if (people.length === 0) {
    return (
      <RecordsEmpty
        title="No people on record for this entity."
        subline="Contractors appear here the moment a rate card, timesheet, or compliance doc names them."
      />
    )
  }

  return (
    <section aria-label="People">
      <HubHeader title="People" count={people.length} countNoun="person" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Name' },
          { label: 'Role' },
          { label: 'Rate', align: 'right' },
          { label: 'Routing' },
          { label: 'Compliance' },
        ]}
      />
      <div role="list">
        {people.map((person) => {
          const currentRate = person.rateHistory[person.rateHistory.length - 1]
          const missing = person.complianceDocs.filter((d) => d.status === 'missing')
          return (
            <div
              role="listitem"
              key={person.id}
              id={`person-${person.id}`}
              className={cn(
                'grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03]',
                grid,
                highlightedId === person.id && 'bg-foreground/[0.04]',
              )}
            >
              <RecordHover recordId={person.id} onClick={() => onOpenPerson(person.id)}>
                <span className="text-title truncate font-medium text-foreground">
                  {person.name}
                </span>
              </RecordHover>
              <span className="text-meta truncate">{person.role}</span>
              <span className="text-right font-mono text-sm tabular-nums text-foreground">
                {currentRate?.rateDisplay ?? '—'}
              </span>
              <span className="text-meta truncate">
                {person.routing.mode === 'routed'
                  ? `routed · ${person.routing.routedVia}`
                  : 'direct'}
              </span>
              <span className="flex items-center gap-1.5">
                {missing.length === 0 ? (
                  <Badge variant="outline" className="bg-prepared/10 text-prepared border-prepared/20 font-normal">
                    complete
                  </Badge>
                ) : (
                  missing.map((d) => (
                    <Badge
                      key={d.kind}
                      variant="outline"
                      className="bg-held/10 text-held border-held/20 font-normal"
                    >
                      {d.kind} missing
                    </Badge>
                  ))
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
