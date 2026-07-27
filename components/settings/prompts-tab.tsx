'use client'

import { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { prompts, type PromptRecord } from '@/lib/fixtures/settings'
import { cn } from '@/lib/utils'

export function PromptsTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-meta max-w-prose">
        Prompts are versioned config records, read-only here. Edits ship
        through the repo like any other rule change.
      </p>
      <div className="flex flex-col border-t border-border">
        {prompts.map((prompt) => (
          <PromptRow key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  )
}

function PromptRow({ prompt }: { prompt: PromptRecord }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ChevronRightIcon
          aria-hidden
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200 ease-out',
            open && 'rotate-90',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-baseline gap-3">
            <h3 className="text-title truncate font-medium text-foreground">
              {prompt.name}
            </h3>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {prompt.currentVersion}
            </span>
            <span className="text-meta ml-auto hidden shrink-0 sm:block">
              used by{' '}
              <span className="font-mono tabular-nums">
                {prompt.usedBySuggestions.toLocaleString('en-US')}
              </span>{' '}
              suggestions
            </span>
          </div>
          <p className="text-meta truncate">
            {prompt.purpose} ·{' '}
            <span className="font-mono text-xs">{prompt.model}</span>
          </p>
        </div>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <ol className="mb-3 ml-[26px] flex flex-col border-l border-border">
            {prompt.history.map((version) => (
              <li
                key={version.version}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-1.5 pl-4"
              >
                <span className="font-mono text-xs tabular-nums text-foreground">
                  {version.version}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
                  {version.date}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {version.note}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
