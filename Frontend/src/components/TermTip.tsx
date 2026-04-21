import type { ReactNode } from 'react'

type Props = {
  term: string
  tip: string
  children?: ReactNode
}

/** Accessible “AI term” hint: keyboard focus shows full tip. */
export function TermTip({ term, tip, children }: Props) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      {children ?? (
        <abbr
          title={tip}
          className="cursor-help border-b border-dotted border-primary/50 font-medium text-primary decoration-none"
        >
          {term}
        </abbr>
      )}
    </span>
  )
}
