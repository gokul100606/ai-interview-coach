import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-ink-800">{label}</p>
        <p className="text-xs text-ink-400">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-ink-800' : 'bg-ink-100'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { logout } = useAuth()
  const [emailDigest, setEmailDigest] = useState(true)
  const [reminders, setReminders] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink-800">Settings</h2>

      <Card className="divide-y divide-ink-100 p-6">
        <Toggle checked={emailDigest} onChange={() => setEmailDigest((v) => !v)} label="Weekly progress email" description="A summary of your interviews and score trend, every Monday." />
        <Toggle checked={reminders} onChange={() => setReminders((v) => !v)} label="Practice reminders" description="Nudge me if I haven't practiced in 3 days." />
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-ink-800">Account</h3>
        <p className="mt-1 text-sm text-ink-400">Log out of AI Interview Coach on this device.</p>
        <Button variant="secondary" className="mt-4" onClick={logout}>Log out</Button>
      </Card>
    </div>
  )
}
