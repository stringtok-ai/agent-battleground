import { useLayoutEffect, useRef } from 'react'
import type { BattlegroundKind } from './gameRouting'
import { mountBattleground } from './scenes'

type Props = {
  kind: BattlegroundKind
  agentCount: number
  className?: string
}

export function BattlegroundCanvas({ kind, agentCount, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<ReturnType<typeof mountBattleground> | null>(null)

  useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    handleRef.current?.dispose()
    handleRef.current = mountBattleground(el, { kind, agentCount })
    return () => {
      handleRef.current?.dispose()
      handleRef.current = null
    }
  }, [kind, agentCount])

  return (
    <div
      ref={hostRef}
      className={className ?? 'h-[min(52vh,440px)] w-full min-h-[260px] overflow-hidden rounded-xl border border-border bg-black'}
    />
  )
}
