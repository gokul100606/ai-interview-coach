import { useState } from 'react'
import { FileCheck2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import { getApiErrorMessage } from '@/services/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [targetRole, setTargetRole] = useState(user?.targetRole || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    setSaved(false)
    setIsSaving(true)
    try {
      const updated = await userService.updateMe({ name, targetRole })
      updateUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not save your profile. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink-800">Profile</h2>

      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 text-lg font-semibold text-white">
            {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-medium text-ink-800">{name}</p>
            <p className="text-sm text-ink-400">{user?.email}</p>
          </div>
        </div>

        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Target role"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Frontend Engineer"
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Skills</p>
          <div className="flex flex-wrap gap-2">
            {(user?.skills || []).map((s) => (
              <span key={s} className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600">
                {s}
              </span>
            ))}
            {(!user?.skills || user.skills.length === 0) && <p className="text-sm text-ink-400">No skills added yet.</p>}
          </div>
        </div>

        {/* Resume upload has no backend support yet (no file storage or
            parsing exists) — shown honestly as unavailable rather than a
            fake filename with a non-functional "Replace" control. */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Resume</p>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-paper px-4 py-3.5 text-sm text-ink-400">
            <FileCheck2 className="h-4 w-4 text-ink-300" />
            Resume upload isn't available yet
            <span className="ml-auto rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">Coming soon</span>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">
            {error}
          </p>
        )}

        <Button onClick={handleSave} isLoading={isSaving} disabled={!name.trim()}>
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </Card>
    </div>
  )
}
