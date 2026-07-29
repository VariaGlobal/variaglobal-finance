'use client'

import { useState } from 'react'
import { DownloadIcon, FileTextIcon, SparklesIcon, TableIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { documentDetails, evidenceLabels } from '@/lib/fixtures/records/documents'
import type { DocumentRef } from '@/lib/types'

interface DocumentPreviewDrawerProps {
  document: DocumentRef | null
  onOpenChange: (open: boolean) => void
  onOpenEvidence: (tab: string, openId?: string) => void
}

/**
 * Document preview drawer — inline preview placeholder, Download,
 * metadata rail with evidences backlinks, and a stored AI analysis
 * block behind an explicit "Analyze with AI" button. Never auto-runs.
 */
export function DocumentPreviewDrawer({
  document,
  onOpenChange,
  onOpenEvidence,
}: DocumentPreviewDrawerProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  const details = document ? documentDetails[document.id] : undefined
  const analysis = details?.analysis

  function handleOpenChange(open: boolean) {
    if (!open) setShowAnalysis(false)
    onOpenChange(open)
  }

  return (
    <Sheet open={document !== null} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="gap-0 overflow-y-auto sm:max-w-xl">
        {document && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle className="font-mono text-sm break-all">{document.name}</SheetTitle>
              <SheetDescription>
                Uploaded {document.uploadedAt}
                {details ? ` by ${details.uploadedBy}` : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-4">
              {/* Inline preview placeholder frame */}
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40">
                {details?.previewKind === 'csv' ? (
                  <TableIcon className="size-6 text-muted-foreground/50" />
                ) : (
                  <FileTextIcon className="size-6 text-muted-foreground/50" />
                )}
                <p className="font-mono text-xs text-muted-foreground">
                  {details?.previewKind === 'csv' ? 'CSV preview' : 'PDF preview'}
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  Inline rendering lands with the backend
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <DownloadIcon data-icon="inline-start" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnalysis(true)}
                  disabled={showAnalysis || !analysis}
                  className="text-muted-foreground"
                >
                  <SparklesIcon data-icon="inline-start" />
                  {analysis ? 'Analyze with AI' : 'No stored analysis'}
                </Button>
              </div>

              {/* Stored analysis — shown only on explicit request */}
              {showAnalysis && analysis && (
                <div className="rounded-md border border-border">
                  <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2">
                    <span className="text-[11px] tracking-wide text-muted-foreground/70 uppercase">
                      Stored analysis
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {analysis.model} · {analysis.date}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1.5 px-3 py-2.5">
                    {analysis.lines.map((line) => (
                      <li key={line} className="text-xs leading-relaxed text-foreground">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata rail */}
              <dl className="flex flex-col gap-2.5 border-t border-border pt-4">
                <div className="flex items-baseline gap-3">
                  <dt className="w-24 shrink-0 text-xs text-muted-foreground">Kind</dt>
                  <dd>
                    <Badge
                      variant="outline"
                      className="bg-muted font-normal text-muted-foreground"
                    >
                      {document.kind}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-baseline gap-3">
                  <dt className="w-24 shrink-0 text-xs text-muted-foreground">sha-256</dt>
                  <dd className="min-w-0 font-mono text-[11px] break-all text-foreground">
                    {document.hash.replace('sha256:', '')}
                  </dd>
                </div>
                <div className="flex items-baseline gap-3">
                  <dt className="w-24 shrink-0 text-xs text-muted-foreground">Uploaded</dt>
                  <dd className="font-mono text-xs tabular-nums text-foreground">
                    {document.uploadedAt}
                    {details ? ` · ${details.uploadedBy}` : ''}
                  </dd>
                </div>
                <div className="flex items-baseline gap-3">
                  <dt className="w-24 shrink-0 text-xs text-muted-foreground">Evidences</dt>
                  <dd className="flex min-w-0 flex-col gap-1">
                    {document.evidences.map((id) => {
                      const target = evidenceLabels[id]
                      return target ? (
                        <button
                          key={id}
                          type="button"
                          onClick={() => onOpenEvidence(target.tab, target.openId)}
                          className="text-left text-xs text-foreground underline decoration-border underline-offset-[3px] transition-colors duration-150 hover:decoration-foreground/50"
                        >
                          {target.label}
                        </button>
                      ) : (
                        <span key={id} className="font-mono text-xs text-muted-foreground">
                          {id}
                        </span>
                      )
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
