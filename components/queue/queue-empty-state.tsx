/** The hero screen of the whole app: oversized, quiet, editorial. */
export function QueueEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-24 text-center">
      <h2 className="max-w-3xl font-sans text-[clamp(40px,6vw,64px)] leading-[1.05] font-medium tracking-[-0.02em] text-balance text-foreground/40">
        Every dollar, accounted for.
      </h2>
      <p className="font-mono text-[13px] leading-relaxed text-muted-foreground">
        {filtered
          ? 'Nothing matches these filters — clear a chip or two.'
          : 'Queue is clear — the business owes the system nothing.'}
      </p>
    </div>
  )
}
