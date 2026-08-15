import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileCheck2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { interviewService } from '@/services/interviewService'
import { getApiErrorMessage } from '@/services/api'
import type { Difficulty, InterviewType } from '@/types/interview'

const types: InterviewType[] = ['Technical', 'Behavioral', 'System Design', 'Mixed']
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

export default function InterviewSetup() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [type, setType] = useState<InterviewType>('Technical')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [questionCount, setQuestionCount] = useState(8)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('') 

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  async function handleCreate() {
    if (!role) return
    setError('')
    setIsSubmitting(true)
    try {
      const interview = await interviewService.create({
        role,
        interviewType: type,
        difficulty,
        questionCount,
      })
      navigate(`/interview/${interview.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not create the interview. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink-800">Set up your interview</h2>
        <p className="mt-1 text-sm text-ink-400">A few details and we'll build a question set around them.</p>
      </div>

      <Card className="space-y-6 p-6">
        <Input label="Target role" placeholder="e.g. Frontend Engineer" value={role} onChange={(e) => setRole(e.target.value)} />

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Interview type</p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  type === t ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-100 text-ink-600 hover:border-ink-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Difficulty</p>
          <div className="flex gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                  difficulty === d ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-100 text-ink-600 hover:border-ink-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-700">Number of questions</p>
            <span className="font-mono text-sm text-ink-500">{questionCount}</span>
          </div>
          <input
            type="range"
            min={4}
            max={15}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full accent-ink-800"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Resume (optional)</p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-paper px-4 py-8 text-center transition-colors hover:border-ink-400">
            {fileName ? (
              <>
                <FileCheck2 className="h-6 w-6 text-sage" />
                <span className="text-sm font-medium text-ink-700">{fileName}</span>
                <span className="text-xs text-ink-400">Click to replace</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 text-ink-300" />
                <span className="text-sm font-medium text-ink-600">Upload a PDF resume</span>
                <span className="text-xs text-ink-400">Up to 5MB — questions will reference your real experience</span>
              </>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
          </label>
        </div>

        <Button className="w-full" size="lg" disabled={!role} isLoading={isSubmitting} onClick={handleCreate}>
          Generate questions
        </Button>
         {error && (
          <p role="alert" className="rounded-lg bg-rust-50 px-3 py-2 text-sm text-rust-600">
            {error}
          </p>
        )}
      </Card>
    </div>
  )
}
