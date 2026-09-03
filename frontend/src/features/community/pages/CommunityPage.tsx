import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MessageCircle,
  Shield,
  Plus,
  X,
  PenLine,
  GraduationCap,
  CheckCircle2,
  Eye,
  Send,
} from 'lucide-react'
import { communityApi, projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/CharacterState'

interface CommunityProject {
  id: string
  title: string
  description: string
  skills?: string[]
  state?: string
  visibility?: string
  updatedAt?: string
  learner?: {
    id: string
    displayName: string
    avatarUrl?: string
  }
}

/**
 * Moderation-status badge.
 *
 * The public community feed (GET /community/feed) only ever returns
 * projects with visibility=PUBLIC and state=SHOWCASED (already reviewed
 * for showcase-worthiness on the backend). Anything a learner just
 * submitted stays out of this list until it's been through that
 * showcase step, so everything visible here is effectively
 * "approved / visible to everyone." We still render an explicit badge
 * so kids get a clear, friendly confirmation rather than silence.
 */
function ModerationBadge({ state }: { state?: string | undefined }) {
  if (state === 'SHOWCASED') {
    return (
      <span className="inline-flex items-center gap-1 bg-success-100 text-success-700 text-xs font-semibold px-3 py-1 rounded-control">
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
        Approved &amp; Live
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 bg-warning-100 text-warning-700 text-xs font-semibold px-3 py-1 rounded-control">
      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
      Being Checked
    </span>
  )
}

export function CommunityPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { data: feed, isLoading, isError, refetch } = useQuery({
    queryKey: ['community-feed'],
    queryFn: () => communityApi.getFeed({ limit: 20 }).then((res) => res.data),
  })

  const projects: CommunityProject[] = feed?.projects ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    setSubmitState('submitting')
    setErrorMessage('')

    try {
      // 1. Create the project as a draft (real backend route: POST /projects)
      const created = await projectsApi
        .create({
          title: title.trim(),
          description: description.trim(),
          type: 'SHOWCASE',
          visibility: 'PUBLIC',
          tags: [],
        })
        .then((res) => res.data)

      // 2. Mark it complete-ready and send it into the showcase/moderation
      //    pipeline. showcaseProject() requires state COMPLETED, so we
      //    first move it there, then request showcase — which is the
      //    real "submit for grown-up review" step on the backend.
      await projectsApi.update(created.id, { state: 'COMPLETED' })
      await projectsApi.showcase(created.id)

      setSubmitState('submitted')
      setTitle('')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['community-feed'] })
    } catch (err: any) {
      setSubmitState('error')
      setErrorMessage(
        err?.response?.data?.message ||
          "That didn't quite make it to the review helpers — no worries, let's try sending it again!",
      )
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Link>
              <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" strokeWidth={2} />
                Community
              </h1>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4" strokeWidth={2} />
                  Close
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Share Something
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Safety banner - always visible, always up front */}
        <div className="card mb-6 bg-primary-50 border-primary-200 flex items-start gap-3">
          <div className="icon-chip bg-primary-100 text-primary-600 flex-shrink-0">
            <Shield className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display font-semibold text-primary-900">
              This is a safe, kid-friendly space!
            </p>
            <p className="text-sm text-primary-800">
              Every post is checked by a grown-up helper before anyone else can see it,
              so only friendly, safe posts show up here.
            </p>
          </div>
        </div>

        {/* Post creation form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="card mb-8">
                <h2 className="text-xl font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-primary-600" strokeWidth={2} />
                  Share with the Community
                </h2>

                {/* Child-safe, moderation-first copy — safety-critical UX, content unchanged */}
                <div className="bg-warning-50 border border-warning-200 rounded-control p-3 mb-4 flex items-start gap-2">
                  <GraduationCap className="w-5 h-5 text-warning-700 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm text-warning-900 font-medium">
                    Your post will be checked by a grown-up helper before others can see it!
                    This keeps everyone in our community safe.
                  </p>
                </div>

                {submitState === 'submitted' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="icon-chip bg-success-50 text-success-600 w-14 h-14 mx-auto mb-3">
                      <Send className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <p className="font-display font-bold text-lg text-success-700">
                      Sent for review!
                    </p>
                    <p className="text-slate-600 text-sm mt-1">
                      A grown-up helper will check your post soon. Once it's approved,
                      it will show up here for everyone to see!
                    </p>
                    <button
                      onClick={() => setSubmitState('idle')}
                      className="btn btn-outline mt-4"
                    >
                      Share Something Else
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Title
                      </label>
                      <input
                        className="input"
                        placeholder="What did you make or learn?"
                        value={title}
                        maxLength={120}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Tell us about it
                      </label>
                      <textarea
                        className="input min-h-[100px]"
                        placeholder="Share the fun stuff! Remember: no personal info like your address or school name."
                        value={description}
                        maxLength={1000}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    {submitState === 'error' && (
                      <p className="text-error-600 text-sm font-medium">{errorMessage}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitState === 'submitting'}
                      className="btn btn-primary w-full disabled:opacity-60"
                    >
                      {submitState === 'submitting' ? (
                        'Sending to a helper…'
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={2} />
                          Submit for Review
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed */}
        <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Approved Posts</h2>

        {isLoading ? (
          <LoadingState character="Luma" message="Luma is fetching new posts from the community..." />
        ) : isError ? (
          <ErrorState
            character="Luma"
            title="Couldn't load the community feed"
            message="No worries — this happens sometimes. Let's give it another try."
            onRetry={() => refetch()}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            character="Luma"
            title="No posts here yet!"
            message="Be the first to share something once it's checked by a helper."
            actionLabel="Share Something"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700">
                      {project.learner?.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {project.learner?.displayName || 'A learner'}
                    </span>
                  </div>
                  <ModerationBadge state={project.state ?? undefined} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-4">{project.description}</p>
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-secondary-50 text-secondary-700 px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {project.updatedAt && (
                  <p className="text-xs text-slate-400 mt-3">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
