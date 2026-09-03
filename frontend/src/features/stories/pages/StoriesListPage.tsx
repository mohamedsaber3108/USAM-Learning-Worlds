import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { storiesApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

// Story Engine list page (gap matrix cluster-8) — small, real branching
// story library, not a full authoring platform. Each card links into
// StoryReaderPage, which walks the choiceOptions branching tree.
const AGE_LABEL: Record<string, string> = {
  AGE_8_9: 'Ages 8-9',
  AGE_10_11: 'Ages 10-11',
  AGE_12_14: 'Ages 12-14',
}

export function StoriesListPage() {
  const { data: stories, isLoading, isError, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: () => storiesApi.listStories().then((res) => res.data),
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" strokeWidth={2} />
            Choose-Your-Path Stories
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Pick a story, then choose what happens next on every page.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <LoadingState character="Zara" message="Zara is pulling stories from the shelf..." />
        )}

        {isError && (
          <ErrorState
            character="Zara"
            title="Couldn't load the stories"
            message="No worries — this happens sometimes. Let's give it another try."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && (stories || []).length === 0 && (
          <EmptyState
            character="Zara"
            title="No stories here yet"
            message="Zara is still writing your first choose-your-path adventure. Check back soon, or explore a mission while you wait!"
            actionLabel="Explore Missions"
            actionTo="/missions"
          />
        )}

        {!isLoading && !isError && (stories || []).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(stories || []).map((story) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="card hover:shadow-soft-hover transition-shadow block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-heading font-bold text-gray-900">
                    {story.domain?.icon || '📖'} {story.title}
                  </h2>
                  <span className="ml-2 shrink-0 px-2 py-1 rounded text-xs font-bold bg-primary-100 text-primary-800">
                    {AGE_LABEL[story.ageBand] || story.ageBand}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{story.summary}</p>
                <p className="text-xs text-gray-400">
                  {story.domain?.name} · {story._count?.pages ?? 0} pages
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
