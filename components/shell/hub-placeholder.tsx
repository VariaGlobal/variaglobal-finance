/**
 * Quiet placeholder for hubs that ship in a later phase — a calmer
 * variant of the queue's hero empty state.
 */
export function HubPlaceholder({
  title,
  subline,
}: {
  title: string
  subline: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
      <h2 className="max-w-2xl font-sans text-[clamp(28px,4vw,44px)] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-foreground/30">
        {title}
      </h2>
      <p className="font-mono text-[13px] leading-relaxed text-muted-foreground">
        {subline}
      </p>
    </div>
  )
}
