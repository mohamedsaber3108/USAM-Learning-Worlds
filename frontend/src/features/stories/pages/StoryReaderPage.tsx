import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, RotateCcw } from 'lucide-react'
import { storiesApi, type StoryPage } from '@/lib/api/endpoints'

// Story Reader — walks the `choiceOptions` branching tree client-side.
// Story Branching Engine (gap matrix) is satisfied by this same Json
// structure; there is no separate branching-engine service to call.
export function StoryReaderPage() {
  const { id } = useParams<{ id: string }>()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const [history, setHistory] = useState<number[]>([])

  const { data: story, isLoading, isError } = useQuery({
    queryKey: ['story', id],
    queryFn: () => storiesApi.getStory(id!).then((res) => res.data),
    enabled: !!id,
  })

  const currentPage: StoryPage | undefined = story?.pages.find(
    (p) => p.pageNumber === currentPageNumber,
  )
  const isEnding = !currentPage?.choiceOptions || currentPage.choiceOptions.length === 0

  function choose(nextPageNumber: number | null) {
    if (nextPageNumber == null) return
    setHistory((h) => [...h, currentPageNumber])
    setCurrentPageNumber(nextPageNumber)
  }

  function restart() {
    setHistory([])
    setCurrentPageNumber(1)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/stories" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back to Stories
            </Link>
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" strokeWidth={2} />
              {story?.title || 'Story'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}

        {isError && (
          <div className="card text-center py-8">
            <p className="text-gray-700">Could not load this story right now.</p>
          </div>
        )}

        {story && currentPage && (
          <div className="card">
            <p className="text-xs text-gray-400 mb-4">
              Page {currentPage.pageNumber} of {story.pages.length}
              {currentPage.safetyReviewed && (
                <span className="ms-2 text-emerald-600">✓ Safety reviewed</span>
              )}
            </p>

            <div className="prose prose-slate max-w-none whitespace-pre-line text-gray-800 leading-relaxed mb-6">
              {currentPage.text}
            </div>

            {!isEnding ? (
              <div className="space-y-3">
                {(currentPage.choiceOptions ?? []).map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => choose(choice.nextPageNumber)}
                    className="w-full text-start px-4 py-3 rounded-lg border-2 border-primary-200 hover:border-primary-500 hover:bg-primary-50 transition-colors font-medium text-gray-800"
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-lg font-heading font-bold text-primary-700 mb-4">
                  🎉 You reached the end of this path!
                </p>
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={2} />
                  Read Again From the Start
                </button>
              </div>
            )}

            {history.length > 0 && (
              <button
                onClick={() => {
                  const prev = history[history.length - 1]
                  if (prev === undefined) return
                  setHistory((h) => h.slice(0, -1))
                  setCurrentPageNumber(prev)
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                <span className="inline-block rtl:scale-x-[-1]">←</span> Go back a page
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
