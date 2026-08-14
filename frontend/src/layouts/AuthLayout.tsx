import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <Link to="/" className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800">
            <Sparkles className="h-4 w-4 text-ember-400" />
          </div>
          <span className="font-display text-lg font-semibold text-ink-800">Coach</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <Outlet />
        </div>
      </div>
      <div className="relative hidden w-1/2 items-center justify-center bg-ink-800 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,163,61,0.15),transparent_45%)]" />
        <div className="relative max-w-md px-10 text-center">
          <p className="font-display text-3xl leading-snug text-white">
            &ldquo;The mock interviews felt closer to the real thing than any prep book I used.&rdquo;
          </p>
          <p className="mt-5 text-sm font-medium text-ink-200">Devika Shah — hired as SDE-1 at a Series B startup</p>
        </div>
      </div>
    </div>
  )
}
