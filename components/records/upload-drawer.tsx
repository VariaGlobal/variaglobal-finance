'use client'

import { useCallback, useState } from 'react'
import { CopyCheckIcon, FileSpreadsheetIcon, FileTextIcon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  duplicateUpload,
  sampleUpload,
  type StagedFile,
} from '@/lib/fixtures/records/uploads'

type Stage = 'idle' | 'staged'

/**
 * Upload flow — drag-drop → file card (name · size · sha-256) → staged
 * preview for CSVs → confirm / discard. Parsing is mocked with fixtures;
 * the backend wires real ingestion next. Duplicate detection is by
 * content hash: the same file shows "already on record".
 */
export function UploadDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [stage, setStage] = useState<Stage>('idle')
  const [staged, setStaged] = useState<StagedFile | null>(null)
  const [dragOver, setDragOver] = useState(false)
  // Hashes already on record this session — the fresh CSV joins after confirm.
  const [knownHashes, setKnownHashes] = useState<string[]>([duplicateUpload.hash])

  const stageFile = useCallback(
    (file: StagedFile) => {
      const isDuplicate = knownHashes.includes(file.hash)
      setStaged(
        isDuplicate && !file.duplicateOf
          ? { ...file, duplicateOf: 'doc-mercury-jul-imported' }
          : file,
      )
      setStage('staged')
    },
    [knownHashes],
  )

  function reset() {
    setStage('idle')
    setStaged(null)
    setDragOver(false)
  }

  function confirmImport() {
    if (!staged) return
    setKnownHashes((h) => [...h, staged.hash])
    toast('Import confirmed', {
      description: `${staged.name} · ${staged.rows?.length ?? 0} rows staged for the record — backend wiring lands next.`,
    })
    reset()
    onOpenChange(false)
  }

  function discard() {
    toast('Upload discarded', {
      description: staged ? `${staged.name} was not recorded.` : undefined,
    })
    reset()
  }

  const isDuplicate = Boolean(staged?.duplicateOf) || (staged ? knownHashes.includes(staged.hash) : false)

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <SheetContent side="right" className="gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Upload to the record</SheetTitle>
          <SheetDescription>
            Statements, contracts, exports — hashed on arrival, duplicates never land twice.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {stage === 'idle' && (
            <>
              {/* Drag-drop zone — the drop itself is mocked this phase */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Drop a file to stage it for import"
                onClick={() => stageFile(sampleUpload)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    stageFile(sampleUpload)
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  stageFile(sampleUpload)
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  dragOver
                    ? 'border-ring bg-foreground/[0.03]'
                    : 'border-border hover:border-ring/60 hover:bg-foreground/[0.02]',
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-foreground/[0.06] text-muted-foreground">
                  <UploadIcon className="size-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    Drop a file, or click to stage the sample
                  </p>
                  <p className="text-meta">CSV, PDF, XLSX · parsing is mocked this phase</p>
                </div>
              </div>

              {/* Deterministic samples so both states are reachable */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] tracking-wide text-muted-foreground/70 uppercase">
                  Samples
                </p>
                <button
                  type="button"
                  onClick={() => stageFile(sampleUpload)}
                  className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-left transition-colors duration-150 hover:bg-foreground/[0.03]"
                >
                  <FileSpreadsheetIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">
                      {sampleUpload.name}
                    </span>
                    <span className="text-meta">fresh statement · stages a CSV preview</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => stageFile(duplicateUpload)}
                  className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-left transition-colors duration-150 hover:bg-foreground/[0.03]"
                >
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">
                      {duplicateUpload.name}
                    </span>
                    <span className="text-meta">same hash as a document already on record</span>
                  </span>
                </button>
              </div>
            </>
          )}

          {stage === 'staged' && staged && (
            <>
              {/* File card: name · size · sha-256 in mono */}
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3.5">
                <div className="flex items-center gap-2.5">
                  {staged.kind === 'csv' ? (
                    <FileSpreadsheetIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {staged.name}
                  </p>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {staged.sizeDisplay}
                  </span>
                </div>
                <p className="truncate font-mono text-xs tabular-nums text-muted-foreground/80">
                  {staged.hash}
                </p>
                {isDuplicate && (
                  <div className="flex items-center gap-2 border-t border-border pt-2">
                    <CopyCheckIcon className="text-held size-3.5 shrink-0" />
                    <p className="text-held text-xs">
                      Already on record — this exact content was uploaded before. Nothing
                      to import.
                    </p>
                  </div>
                )}
              </div>

              {/* Staged CSV preview */}
              {!isDuplicate && staged.rows && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] tracking-wide text-muted-foreground/70 uppercase">
                    Staged preview · {staged.rows.length} rows
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="grid grid-cols-[54px_minmax(0,2fr)_90px_minmax(0,1.6fr)] items-baseline gap-2 border-b border-border bg-foreground/[0.02] px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground/70 uppercase">
                      <span>Date</span>
                      <span>Description</span>
                      <span className="text-right">Amount</span>
                      <span>Suggested</span>
                    </div>
                    {staged.rows.map((row) => (
                      <div
                        key={`${row.date}-${row.description}`}
                        className="grid grid-cols-[54px_minmax(0,2fr)_90px_minmax(0,1.6fr)] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
                      >
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.date}
                        </span>
                        <span className="truncate text-xs text-foreground">
                          {row.description}
                        </span>
                        <span className="text-right font-mono text-xs tabular-nums text-foreground">
                          {row.amountDisplay}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'max-w-full font-normal',
                            row.confidence >= 85
                              ? 'bg-suggestion/10 text-suggestion border-suggestion/20'
                              : 'bg-decision/10 text-decision border-decision/20',
                          )}
                        >
                          <span className="truncate">{row.suggestedCategory}</span>
                          <span className="ml-1 font-mono tabular-nums">
                            {row.confidenceDisplay}
                          </span>
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {stage === 'staged' && staged && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">
            <Button variant="outline" onClick={discard}>
              Discard
            </Button>
            <Button onClick={confirmImport} disabled={isDuplicate}>
              {isDuplicate ? 'Already on record' : 'Confirm import'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
