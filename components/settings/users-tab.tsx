import { CheckIcon, MinusIcon } from 'lucide-react'
import { roleCards } from '@/lib/fixtures/settings'

export function UsersTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {roleCards.map((card) => (
        <article key={card.id} className="flex flex-col rounded-lg border border-border">
          <header className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3">
            <h3 className="text-title font-medium text-foreground">{card.name}</h3>
            <p className="text-meta">{card.role}</p>
          </header>
          <ul className="flex flex-col border-t border-border px-4 py-1">
            {card.capabilities.map((cap) => (
              <li
                key={cap.label}
                className="flex items-center gap-2.5 border-b border-border py-2 text-[13px] last:border-b-0"
              >
                {cap.allowed ? (
                  <CheckIcon aria-hidden className="size-3.5 shrink-0 text-prepared" />
                ) : (
                  <MinusIcon
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground/50"
                  />
                )}
                <span
                  className={
                    cap.allowed ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {cap.label}
                </span>
                <span className="sr-only">
                  {cap.allowed ? 'allowed' : 'not allowed'}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
