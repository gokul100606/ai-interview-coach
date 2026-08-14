import { clsx } from 'clsx'

export function ScoreRow({ label, value }: { label: string; value: number }) {
  const tone = value >= 75 ? 'bg-sage' : value >= 50 ? 'bg-ember' : 'bg-rust'
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink-500">{label}</span>
        <span className="font-mono text-ink-700">{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={clsx('h-full rounded-full transition-all duration-700', tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
