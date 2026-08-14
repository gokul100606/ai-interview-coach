import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, hover = false, ...props }: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={clsx(
        'rounded-xl2 border border-ink-100/70 bg-white shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-cardHover',
        className,
      )}
      {...props}
    />
  )
}
