import { Link, useLocation } from 'react-router-dom'

export function MissionCompletePage() {
  const location = useLocation()
  const result = location.state?.result

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No results found</p>
          <Link to="/missions" className="text-primary-600 mt-4 inline-block">
            ← Back to Missions
          </Link>
        </div>
      </div>
    )
  }

  const score = result.finalScore || 0
  const xpEarned = result.xpEarned || 0
  const isPerfect = score >= 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Celebration */}
          <div className="mb-6">
            <div className="text-7xl mb-4">
              {isPerfect ? '🎉' : score >= 80 ? '⭐' : score >= 60 ? '👏' : '💪'}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isPerfect
                ? 'Perfect Score!'
                : score >= 80
                ? 'Great Job!'
                : score >= 60
                ? 'Well Done!'
                : 'Keep Going!'}
            </h1>
            <p className="text-gray-600 text-lg">Mission Complete</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
            <div>
              <p className="text-4xl font-bold text-primary-600 mb-2">{score}%</p>
              <p className="text-gray-600">Final Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-secondary-600 mb-2">+{xpEarned}</p>
              <p className="text-gray-600">XP Earned</p>
            </div>
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-700">{result.feedback}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <Link to="/missions" className="btn btn-primary w-full py-3 text-lg">
              Browse More Missions
            </Link>
            <Link to="/dashboard" className="btn btn-outline w-full py-3 text-lg">
              Back to Dashboard
            </Link>
          </div>

          {/* Encouragement */}
          {!isPerfect && (
            <p className="mt-6 text-sm text-gray-600">
              {score >= 80
                ? 'Almost perfect! Keep up the excellent work!'
                : score >= 60
                ? "You're making great progress!"
                : "Don't give up! Every attempt makes you stronger!"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
