import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Tone = 'neutral' | 'ember' | 'sage' | 'rust' | 'signal'

const tones: Record<Tone, string> = {
  neutral: 'bg-ink-50 text-ink-600',
  ember: 'bg-ember-50 text-ember-700',
  sage: 'bg-sage-50 text-sage-600',
  rust: 'bg-rust-50 text-rust-600',
  signal: 'bg-signal-50 text-signal-600',
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  )
}
