import { useEffect, useState } from 'react'

type Props = {
  /** Seconds until this window locks / starts (ignored when `deadlineIso` is set). */
  initialSeconds?: number
  /** ISO timestamp — countdown tracks wall clock until this instant. */
  deadlineIso?: string
  label?: string
  className?: string
}

function format(total: number) {
  const s = Math.max(0, total)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function secondsUntil(iso: string) {
  const end = new Date(iso).getTime()
  if (Number.isNaN(end)) return 0
  return Math.max(0, Math.floor((end - Date.now()) / 1000))
}

export function ContestCountdown({
  initialSeconds = 0,
  deadlineIso,
  label = 'Locks in',
  className = '',
}: Props) {
  const [left, setLeft] = useState(() => (deadlineIso ? secondsUntil(deadlineIso) : initialSeconds))

  useEffect(() => {
    if (deadlineIso) {
      setLeft(secondsUntil(deadlineIso))
      const t = window.setInterval(() => setLeft(secondsUntil(deadlineIso)), 1000)
      return () => window.clearInterval(t)
    }
    setLeft(initialSeconds)
    const t = window.setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000)
    return () => window.clearInterval(t)
  }, [deadlineIso, initialSeconds])

  const urgent = left > 0 && left <= 60

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm ${
        urgent ? 'border-danger/40 bg-danger/10 text-danger' : 'border-border bg-canvas/60 text-fg'
      } ${className}`.trim()}
      role="timer"
      aria-live="polite"
      aria-label={`${label} ${format(left)}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-soft">{label}</span>
      <span className="font-semibold text-white">{format(left)}</span>
    </div>
  )
}
