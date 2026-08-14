import { Bookmark } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { mockQuestions } from '@/data/mockData'

export default function Bookmarks() {
  // Phase 6+: GET /api/bookmarks. Showing the first two mock questions as bookmarked for now.
  const bookmarked = mockQuestions.slice(0, 2)

  if (bookmarked.length === 0) {
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
        {bookmarked.map((q) => (
          <Card key={q.id} className="p-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral">{q.category}</Badge>
              <Badge tone="signal">{q.difficulty}</Badge>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-ink-800">{q.questionText}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
