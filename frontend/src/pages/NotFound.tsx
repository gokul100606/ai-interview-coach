import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-mono text-sm text-ink-300">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-800">This page went off-script.</h1>
      <p className="mt-2 text-sm text-ink-400">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
