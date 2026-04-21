type Props = {
  value: number
  max?: number
  label?: string
  tone?: 'primary' | 'secondary' | 'accent' | 'success'
  className?: string
}

const tones = {
  primary: 'from-primary to-cyan-400',
  secondary: 'from-secondary to-fuchsia-400',
  accent: 'from-accent to-amber-200',
  success: 'from-success to-emerald-300',
} as const

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'primary',
  className = '',
}: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-xs text-fg-soft">
          <span>{label}</span>
          <span className="font-mono text-fg/90">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-border"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full bg-linear-to-r ${tones[tone]} transition-[width] duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
