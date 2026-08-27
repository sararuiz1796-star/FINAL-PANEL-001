import { Outlet, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '../api'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Spinner } from '../../../components/ui/Spinner'

/**
 * Shell del Research Workspace: header de proyecto + Sidebar + contenido de
 * la pestaña activa (Outlet). Solo Overview tiene contenido real en este
 * paso — Sources/Documents/Notes/Claims/Connections son Sprint 2-8.
 */
export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <header className="border-b border-bg-dark/10 p-6">
          <h1 className="text-h1 font-bold">{project?.title}</h1>
          {project?.research_question && (
            <p className="mt-1 text-body text-text-on-light">{project.research_question}</p>
          )}
        </header>
        <div className="p-6">
          <Outlet context={{ projectId }} />
        </div>
      </div>
    </div>
  )
}
