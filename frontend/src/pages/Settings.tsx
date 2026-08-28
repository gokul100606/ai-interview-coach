import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import { getApiErrorMessage } from '@/services/api'

function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description: string
  disabled?: boolean
}) {
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
        disabled={disabled}
        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-ink-800' : 'bg-ink-100'}`}
      >
        

      <span
  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
    checked ? 'translate-x-5' : 'translate-x-0'
  }`}
/>
      </button>
    </div>
    
  )
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const [emailDigest, setEmailDigest] = useState(user?.preferences?.emailDigest ?? true)
  const [reminders, setReminders] = useState(user?.preferences?.practiceReminders ?? false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle(field: 'emailDigest' | 'practiceReminders', nextValue: boolean) {
    setError('')
    // Optimistic update, reverted below on failure — never silently
    // pretend a save succeeded when the API call actually failed.
    if (field === 'emailDigest') setEmailDigest(nextValue)
    else setReminders(nextValue)

    setIsSaving(true)
    try {
      const payload = field === 'emailDigest' ? { emailDigest: nextValue } : { practiceReminders: nextValue }
      const updated = await userService.updateMe({ preferences: payload })
      updateUser(updated)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not save that setting. Please try again.'))
      if (field === 'emailDigest') setEmailDigest(!nextValue)
      else setReminders(!nextValue)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink-800">Settings</h2>

      <Card className="divide-y divide-ink-100 p-6">
        <Toggle
          checked={emailDigest}
          onChange={() => handleToggle('emailDigest', !emailDigest)}
          label="Weekly progress email"
          description="A summary of your interviews and score trend, every Monday."
          disabled={isSaving}
        />
        <Toggle
          checked={reminders}
          onChange={() => handleToggle('practiceReminders', !reminders)}
          label="Practice reminders"
          description="Nudge me if I haven't practiced in 3 days."
          disabled={isSaving}
        />
      </Card>

      {error && (
        <p role="alert" className="rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">
          {error}
        </p>
      )}

      <Card className="p-6">
        <h3 className="font-semibold text-ink-800">Account</h3>
        <p className="mt-1 text-sm text-ink-400">Log out of AI Interview Coach on this device.</p>
        <Button variant="secondary" className="mt-4" onClick={logout}>
          Log out
        </Button>
      </Card>
    </div>
  )
}
