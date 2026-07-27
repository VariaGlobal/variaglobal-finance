/** Oversized quiet editorial empty state. */
export function QueueEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <h2 className="max-w-2xl font-sans text-4xl leading-tight font-medium tracking-tight text-balance text-foreground md:text-6xl">
        Every dollar, accounted for.
      </h2>
      <p className="text-sm text-muted-foreground">
        {filtered
          ? 'Nothing matches these filters — clear a chip or two.'
          : 'Queue is clear — the business owes the system nothing.'}
      </p>
    </div>
  )
}
