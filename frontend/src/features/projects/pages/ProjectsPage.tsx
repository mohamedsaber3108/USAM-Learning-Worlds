import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FolderKanban, Plus, Star, Sparkles, X, Globe2, ExternalLink } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'

function NewProjectModal({
  onClose,
  onCreated,
  initialTitle = '',
  initialDescription = '',
}: {
  onClose: () => void
  onCreated: (id: string) => void
  initialTitle?: string
  initialDescription?: string
}) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [type, setType] = useState('INDEPENDENT')

  const create = useMutation({
    mutationFn: () =>
      projectsApi.create({ title, description, type, visibility: 'PRIVATE', tags: [] }).then(res => res.data),
    onSuccess: (project: any) => {
      onCreated(project.id)
    },
  })

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card shadow-soft-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-slate-900">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            className="w-full border border-slate-200 rounded-control px-3 py-2 text-sm"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-slate-200 rounded-control px-3 py-2 text-sm"
            placeholder="What are you building?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="w-full border border-slate-200 rounded-control px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="INDEPENDENT">Independent</option>
            <option value="GUIDED">Guided</option>
            <option value="COLLABORATIVE">Collaborative</option>
          </select>
        </div>
        <button
          className="btn btn-primary w-full mt-5"
          disabled={!title.trim() || !description.trim() || create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [adopted, setAdopted] = useState<{ title: string; description: string } | null>(null)

  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsApi.getMy().then(res => res.data),
  })

  const { data: challenges } = useQuery({
    queryKey: ['real-world-challenges'],
    queryFn: () => projectsApi.listRealWorldChallenges().then(res => res.data),
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
            <button
              className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {challenges && challenges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Globe2 className="w-5 h-5 text-secondary-600" strokeWidth={2} />
              <h2 className="font-display font-bold text-lg text-slate-900">Real-World Challenges</h2>
              <span className="text-xs text-slate-500">Adopt one and make it your own project</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {challenges.map((c: any) => (
                <div key={c.id} className="card border border-secondary-100 bg-secondary-50/30">
                  <h3 className="font-display font-semibold text-sm text-slate-900 mb-1">{c.title}</h3>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-3">{c.description}</p>
                  <div className="flex items-center justify-between">
                    {c.externalSourceUrl && (
                      <a
                        href={c.externalSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                      >
                        Source <ExternalLink className="w-3 h-3" strokeWidth={2} />
                      </a>
                    )}
                    <button
                      className="btn btn-sm bg-secondary-600 text-white hover:bg-secondary-700 shadow-none text-xs px-2 py-1"
                      onClick={() => {
                        setAdopted({ title: c.title, description: c.description })
                        setShowModal(true)
                      }}
                    >
                      Adopt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-600">Loading projects...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: any) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="card hover:shadow-soft-hover transition-shadow">
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="icon-chip bg-primary-50 text-primary-600 w-16 h-16 mx-auto mb-4">
              <Sparkles className="w-8 h-8" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No Projects Yet</h2>
            <p className="text-slate-600 mb-6">Start creating your portfolio!</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create Your First Project
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => { setShowModal(false); setAdopted(null) }}
          initialTitle={adopted?.title ?? ''}
          initialDescription={adopted?.description ?? ''}
          onCreated={(id) => {
            setShowModal(false)
            setAdopted(null)
            queryClient.invalidateQueries({ queryKey: ['my-projects'] })
            navigate(`/projects/${id}`)
          }}
        />
      )}
    </div>
  )
}
