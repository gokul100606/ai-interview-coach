import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Topbar({ title }: { title: string }) {
  const { user } = useAuth()
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-paper/80 px-5 backdrop-blur sm:px-8">
      <h1 className="font-display text-xl font-semibold text-ink-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="rounded-full p-2 text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-800"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-white">
          {initials || 'U'}
        </div>
      </div>
    </header>
  )
}
