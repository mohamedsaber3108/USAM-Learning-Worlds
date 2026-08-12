import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { missionsApi } from '@/lib/api/endpoints'

export function MissionPlayerPage() {
  const { runId } = useParams<{ runId: string }>()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [error, setError] = useState('')

  const { data: run, isLoading } = useQuery({
    queryKey: ['mission-run', runId],
    queryFn: () => missionsApi.getRun(Number(runId)).then(res => res.data),
    enabled: !!runId,
  })

  const submitMutation = useMutation({
    mutationFn: (data: any) => missionsApi.submitActivity(Number(runId), data),
    onSuccess: () => {
      // Move to next activity
      if (currentActivity && currentIndex < activities.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setError('')
      } else {
        // Complete the mission
        completeMutation.mutate()
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Submission failed')
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => missionsApi.complete(Number(runId)),
    onSuccess: (response) => {
      navigate('/missions/complete', {
        state: { result: response.data },
      })
    },
  })

  if (isLoading || !run) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const activities = run.mission?.activities || []
  const currentActivity = activities[currentIndex]

  if (!currentActivity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No activities found</p>
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    const answer = answers[currentActivity.id]
    if (!answer) {
      setError('Please provide an answer')
      return
    }

    // Format response based on backend activity type
    let formattedResponse: any = answer
    const type = currentActivity.type
    if (type === 'SELECT' || type === 'multiple_choice') {
      formattedResponse = { selectedAnswers: [answer] }
    } else if (type === 'SOLVE' || type === 'fill_blank') {
      formattedResponse = { answer }
    } else if (type === 'EXPLAIN' || type === 'short_answer') {
      formattedResponse = { explanation: answer }
    } else if (type === 'CODE' || type === 'coding') {
      formattedResponse = { code: answer }
    } else if (type === 'CREATE') {
      formattedResponse = { submission: answer, description: answer }
    } else {
      formattedResponse = { answer }
    }

    submitMutation.mutate({
      activityId: currentActivity.id,
      response: formattedResponse,
    })
  }

  const progress = ((currentIndex + 1) / activities.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900">
              {run.mission?.title || 'Mission'}
            </h1>
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {activities.length}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          {/* Activity Type Badge */}
          <div className="mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {currentActivity.type.replace('_', ' ')}
            </span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {currentActivity.content?.question || currentActivity.content?.problem || currentActivity.content?.prompt || currentActivity.title || currentActivity.question || currentActivity.prompt}
            </h2>
            {(currentActivity.content?.context || currentActivity.context) && (
              <p className="text-gray-600 mb-4">{currentActivity.content?.context || currentActivity.context}</p>
            )}
          </div>

          {/* Activity Content */}
          <ActivityContent
            activity={currentActivity}
            answer={answers[currentActivity.id]}
            onChange={(value) =>
              setAnswers({ ...answers, [currentActivity.id]: value })
            }
          />

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || completeMutation.isPending}
              className="btn btn-primary disabled:opacity-50"
            >
              {submitMutation.isPending || completeMutation.isPending
                ? 'Submitting...'
                : currentIndex === activities.length - 1
                ? 'Complete Mission'
                : 'Next →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// Activity Content Component
function ActivityContent({
  activity,
  answer,
  onChange,
}: {
  activity: any
  answer: any
  onChange: (value: any) => void
}) {
  const type = activity.type?.toLowerCase()
  const options = activity.content?.options || activity.options || []
  const question = activity.content?.question || activity.question || activity.prompt || activity.title

  switch (type) {
    case 'select':
    case 'multiple_choice':
      return (
        <div className="space-y-3">
          {options.map((option: string, index: number) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                answer === option
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      )

    case 'solve':
    case 'fill_blank':
      return (
        <input
          type="text"
          className="input"
          placeholder="Type your answer..."
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'explain':
    case 'short_answer':
      return (
        <textarea
          className="input min-h-[150px]"
          placeholder="Type your answer..."
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'true_false':
      return (
        <div className="space-y-3">
          {['True', 'False'].map((option) => (
            <label
              key={option}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                answer === option
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={(e) => onChange(e.target.value)}
                className="mr-3"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      )

    case 'code':
    case 'coding':
      return (
        <textarea
          className="input min-h-[300px] font-mono text-sm"
          placeholder="Write your code here..."
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    default:
      return (
        <textarea
          className="input min-h-[150px]"
          placeholder="Type your answer..."
          value={answer || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
  }
}
