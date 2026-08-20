import { useEffect, useState } from 'react'
import { Bookmark } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { bookmarkService } from '@/services/bookmarkService'
import { getApiErrorMessage } from '@/services/api'
import type { Question } from '@/types/question'

export default function Bookmarks() {
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    bookmarkService
      .getBookmarks()
      .then(setQuestions)
      .catch((err) => setError(getApiErrorMessage(err, "We couldn't load your bookmarks.")))
  }, [])

  async function handleRemove(questionId: string) {
    setRemovingId(questionId)
    try {
      await bookmarkService.removeBookmark(questionId)
      // Only drop it from the list after the backend confirms — never
      // assume success before the response comes back.
      setQuestions((prev) => (prev ? prev.filter((q) => q.id !== questionId) : prev))
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not remove that bookmark. Please try again.'))
    } finally {
      setRemovingId(null)
    }
  }

  // --- Error state ---
  if (error) {
    return (
      <EmptyState
        icon={<Bookmark className="h-8 w-8" />}
        title="Couldn't load your bookmarks"
        description={error}
      />
    )
  }

  // --- Loading state ---
  if (questions === null) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-ink-800">Bookmarked questions</h2>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  // --- Empty state ---
  if (questions.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="h-8 w-8" />}
        title="No bookmarked questions"
        description="Tap the bookmark icon on any interview question to save it here for later review."
      />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-ink-800">Bookmarked questions</h2>
      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">{q.category}</Badge>
                <Badge tone="signal">{q.difficulty}</Badge>
              </div>
              <button
                aria-label="Remove bookmark"
                onClick={() => handleRemove(q.id)}
                disabled={removingId === q.id}
                className="rounded-full p-1.5 text-ember-500 transition-colors hover:bg-ink-50 disabled:opacity-50"
              >
                <Bookmark className="h-5 w-5 fill-ember-500" />
              </button>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-ink-800">{q.questionText}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
