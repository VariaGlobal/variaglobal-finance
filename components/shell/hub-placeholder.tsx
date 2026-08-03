/**
 * Quiet TBD placeholder for sections that ship in a later phase. Framed in the
 * same canvas language as the Records hubs so the shell feels consistent while
 * Queue and Analysis are parked.
 */
export function HubPlaceholder({
  eyebrow = 'To be designed',
  title,
  subline,
}: {
  eyebrow?: string
  title: string
  subline: string
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-3 md:p-5">
      <div className="animate-hub-in flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-card px-8 py-24 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/50" />
          {eyebrow}
        </span>
        <h2 className="max-w-2xl font-sans text-[clamp(26px,3.4vw,40px)] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-foreground/35">
          {title}
        </h2>
        <p className="mt-4 max-w-md font-mono text-[13px] leading-relaxed text-muted-foreground">
          {subline}
        </p>
      </div>
    </div>
  )
}
