'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import {
  HubBody,
  HubCanvas,
  PageHeader,
  RecordsEmpty,
  TableHead,
  rowClass,
} from '@/components/records/records-bits'
import { cn } from '@/lib/utils'
import type { Person } from '@/lib/types'

const grid = 'grid-cols-[minmax(160px,1.4fr)_minmax(120px,1fr)_100px_minmax(140px,1fr)_130px]'

export function PeopleHub({
  people,
  highlightedId,
  onOpenPerson,
  action,
}: {
  people: Person[]
  highlightedId?: string | null
  onOpenPerson: (personId: string) => void
  action?: React.ReactNode
}) {
  if (people.length === 0) {
    return (
      <HubCanvas>
        <RecordsEmpty
          title="No people on record for this entity."
          subline="Contractors appear here the moment a rate card, timesheet, or compliance doc names them."
        />
      </HubCanvas>
    )
  }

  return (
    <HubCanvas>
      <section aria-label="People" className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="People"
          count={people.length}
          countNoun="person"
          countNounPlural="people"
          description="Contractors, staff, and collaborators — rates, routing, and compliance in one place."
          action={action}
        />
        <HubBody>
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
                    rowClass(grid, true),
                    highlightedId === person.id && 'bg-foreground/[0.045]',
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
                  <span className="flex flex-wrap items-center gap-1.5">
                    {missing.length === 0 ? (
                      <Badge
                        variant="outline"
                        className="border-prepared/20 bg-prepared/10 font-normal text-prepared"
                      >
                        complete
                      </Badge>
                    ) : (
                      missing.map((d) => (
                        <Badge
                          key={d.kind}
                          variant="outline"
                          className="border-held/20 bg-held/10 font-normal text-held"
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
        </HubBody>
      </section>
    </HubCanvas>
  )
}
