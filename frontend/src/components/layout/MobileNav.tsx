import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, History, User } from 'lucide-react'
import { clsx } from 'clsx'

const links = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/interview/setup', label: 'New', icon: PlusCircle },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
              isActive ? 'text-ink-800' : 'text-ink-300',
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
