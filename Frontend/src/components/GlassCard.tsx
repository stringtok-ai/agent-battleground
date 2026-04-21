import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  hover?: boolean
  as?: 'div' | 'section' | 'article'
}

export function GlassCard({ children, className = '', hover = true, as: Tag = 'div' }: Props) {
  return (
    <Tag
      className={`glass rounded-2xl p-5 ${hover ? 'glass-hover' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}
