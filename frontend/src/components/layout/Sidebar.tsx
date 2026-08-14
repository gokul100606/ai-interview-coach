import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, History, BookmarkCheck, User, Settings, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/interview/setup', label: 'New Interview', icon: PlusCircle },
  { to: '/history', label: 'History', icon: History },
  { to: '/bookmarks', label: 'Bookmarks', icon: BookmarkCheck },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800">
          <Sparkles className="h-4 w-4 text-ember-400" />
        </div>
        <span className="font-display text-lg font-semibold text-ink-800">Coach</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-ink-800 text-white' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-4">
        <div className="rounded-xl bg-paper p-3.5">
          <p className="text-xs font-medium text-ink-500">Weekly goal</p>
          <p className="mt-1 text-sm font-semibold text-ink-800">3 of 5 interviews done</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full w-3/5 rounded-full bg-ember" />
          </div>
        </div>
      </div>
    </aside>
  )
}
