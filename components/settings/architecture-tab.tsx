import { ArrowDownIcon, ArrowRightIcon } from 'lucide-react'
import { archStages } from '@/lib/fixtures/settings'

/**
 * Living system map: sources → pipelines → records → engines → queue → views.
 * Layout only — each stage links to its repo doc for the real detail.
 */
export function ArchitectureTab() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-meta max-w-prose">
        How a dollar travels through the system. Each stage links to its doc in
        the repo — the docs are the source of truth, this map is the index.
      </p>

      <ol className="flex flex-col items-stretch gap-2 xl:flex-row xl:items-start">
        {archStages.map((stage, index) => (
          <li key={stage.id} className="flex flex-col gap-2 xl:flex-1 xl:flex-row xl:items-center">
            <article className="flex w-full flex-col rounded-lg border border-border px-4 py-3">
              <header className="flex items-baseline gap-2.5 pb-2">
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                  {stage.number}
                </span>
                <h3 className="text-title font-medium text-foreground">
                  {stage.title}
                </h3>
              </header>
              <ul className="flex flex-col border-t border-border pt-2">
                {stage.items.map((item) => (
                  <li key={item} className="text-meta py-0.5">
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={stage.docHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 border-t border-border pt-2 font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {stage.docLabel}
              </a>
            </article>

            {index < archStages.length - 1 && (
              <>
                <ArrowDownIcon
                  aria-hidden
                  className="mx-auto size-3.5 shrink-0 text-muted-foreground/40 xl:hidden"
                />
                <ArrowRightIcon
                  aria-hidden
                  className="hidden size-3.5 shrink-0 text-muted-foreground/40 xl:block"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
