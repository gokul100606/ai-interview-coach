import { useState } from 'react'
import { FileCheck2, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [targetRole, setTargetRole] = useState(user?.targetRole || '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // Phase 6+: PUT /api/users/me
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <Input label="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Frontend Engineer" />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Skills</p>
          <div className="flex flex-wrap gap-2">
            {(user?.skills || []).map((s) => (
              <span key={s} className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-700">Resume</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-paper px-4 py-3.5 text-sm text-ink-600 transition-colors hover:border-ink-400">
            <FileCheck2 className="h-4 w-4 text-sage" />
            resume_ananya_rao.pdf
            <span className="ml-auto flex items-center gap-1 text-xs text-ink-400"><UploadCloud className="h-3.5 w-3.5" /> Replace</span>
            <input type="file" accept="application/pdf" className="hidden" />
          </label>
        </div>

        <Button onClick={handleSave}>{saved ? 'Saved' : 'Save changes'}</Button>
      </Card>
    </div>
  )
}
