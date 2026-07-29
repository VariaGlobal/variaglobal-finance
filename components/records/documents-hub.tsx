'use client'

import { Badge } from '@/components/ui/badge'
import { RecordHover } from '@/components/records/record-hover'
import { HubHeader, RecordsEmpty, TableHead } from '@/components/records/records-bits'
import type { DocumentRef } from '@/lib/types'

const grid = 'grid-cols-[minmax(220px,2fr)_100px_minmax(200px,1.6fr)_90px]'

function shortHash(hash: string): string {
  const hex = hash.replace('sha256:', '')
  return `sha256:${hex.slice(0, 8)}…${hex.slice(-6)}`
}

export function DocumentsHub({
  documents,
  onOpenDocument,
}: {
  documents: DocumentRef[]
  onOpenDocument: (documentId: string) => void
}) {
  if (documents.length === 0) {
    return (
      <RecordsEmpty
        title="No documents on record."
        subline="Every statement, contract, and compliance doc is hashed on upload — duplicates never land twice."
      />
    )
  }

  return (
    <section aria-label="Documents">
      <HubHeader title="Documents" count={documents.length} countNoun="document" />
      <TableHead
        gridClassName={grid}
        columns={[
          { label: 'Document' },
          { label: 'Kind' },
          { label: 'Content hash' },
          { label: 'Uploaded' },
        ]}
      />
      <div role="list">
        {documents.map((doc) => (
          <div
            role="listitem"
            key={doc.id}
            className={`grid min-h-12 items-center gap-3 border-b border-border px-5 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] ${grid}`}
          >
            <RecordHover recordId={doc.id} onClick={() => onOpenDocument(doc.id)}>
              <span className="text-title truncate font-medium text-foreground">
                {doc.name}
              </span>
            </RecordHover>
            <Badge variant="outline" className="bg-muted font-normal text-muted-foreground">
              {doc.kind}
            </Badge>
            <span className="truncate font-mono text-xs tabular-nums text-muted-foreground">
              {shortHash(doc.hash)}
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {doc.uploadedAt}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
