import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FolderKanban, Plus, Star, Sparkles } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'

export function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsApi.getMy().then(res => res.data),
  })

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
                <FolderKanban className="w-5 h-5" strokeWidth={2} />
                My Projects
              </h1>
            </div>
            <button className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40">
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600">Loading projects...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: any) => (
              <div key={project.id} className="card">
                <h3 className="font-display font-semibold text-lg text-slate-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  {project.isShowcased && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-50 text-secondary-700 rounded-control text-xs font-medium">
                      <Star className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                      Showcased
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-primary-50 text-primary-600 w-16 h-16 mx-auto mb-4">
              <Sparkles className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No Projects Yet</h2>
            <p className="text-slate-600 mb-6">Start creating your portfolio!</p>
            <button className="btn btn-primary">
              Create Your First Project
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
