import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FolderKanban, Star, Sparkles } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'

/**
 * My Portfolio — a learner's own collected showcased work in one place.
 * Distinct from CommunityPage (the public feed of everyone's showcased
 * projects): this page filters projectsApi.getMy() (the same "/projects/my"
 * endpoint ProjectsPage already uses) down to the learner's own projects
 * that have actually been showcased, i.e. `isShowcased === true` /
 * state === 'SHOWCASED' on the Project row — no new backend needed.
 */
export function MyPortfolioPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsApi.getMy().then((res) => res.data),
  })

  const showcased = Array.isArray(projects)
    ? projects.filter((p: any) => p.isShowcased === true || p.state === 'SHOWCASED')
    : []

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Back
            </Link>
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5" strokeWidth={2} />
              My Portfolio
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-500 text-sm mb-6">
          The best of your work, all in one place — everything here has been showcased.
        </p>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600">Loading your portfolio...</p>
          </div>
        ) : showcased.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {showcased.map((project: any) => (
              <div key={project.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold text-lg text-slate-900">{project.title}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-50 text-secondary-700 rounded-control text-xs font-medium flex-shrink-0">
                    <Star className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                    Showcased
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{project.description}</p>
                <span className="text-xs text-slate-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-primary-50 text-primary-600 w-16 h-16 mx-auto mb-4">
              <Sparkles className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Nothing Showcased Yet</h2>
            <p className="text-slate-600 mb-6">Finish a project and showcase it to see it here!</p>
            <Link to="/projects" className="btn btn-primary">
              Go to My Projects
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
