import { clsx } from 'clsx'

/**
 * Signature element: a waveform of score bars — the visual thread that ties
 * the whole product together. It reads as "a spoken answer" on the landing
 * hero, as a live indicator in the Interview Room, and as the score display
 * on Evaluation/Report screens (bar height + color = performance).
 */
const toneFor = (v: number) => (v >= 75 ? 'bg-sage' : v >= 50 ? 'bg-ember' : 'bg-rust')

export function Waveform({
  values,
  animated = false,
  className,
  barClassName,
}: {
  values: number[] // 0-100
  animated?: boolean
  className?: string
  barClassName?: string
}) {
  return (
    <div className={clsx('flex items-end gap-1', className)} aria-hidden="true">
      {values.map((v, i) => (
        <div
          key={i}
          className={clsx(
            'w-1.5 rounded-full origin-bottom',
            animated ? 'bg-signal-400 animate-wave' : toneFor(v),
            barClassName,
          )}
          style={{
            height: `${Math.max(v, 8)}%`,
            animationDelay: animated ? `${i * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}
