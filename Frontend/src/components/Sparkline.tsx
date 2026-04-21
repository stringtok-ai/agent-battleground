import { useId } from 'react'

type Props = {
  values: number[]
  className?: string
}

export function Sparkline({ values, className = '' }: Props) {
  const gid = useId().replace(/:/g, '')
  const w = 120
  const h = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 2
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1 || 1)) * (w - pad * 2)
    const t = max === min ? 0.5 : (v - min) / (max - min)
    const y = h - pad - t * (h - pad * 2)
    return `${x},${y}`
  })
  const d = `M ${pts.join(' L ')}`
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2d7bff" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
