import { Outlet, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '../api'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Spinner } from '../../../components/ui/Spinner'
import { RibbonDivider } from '../../../components/ui/Ribbon'
import { projectTypeColor, projectTypeLabel } from '../../../lib/projectTypeGroups'

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

  const accent = project ? projectTypeColor(project.project_type) : '#0A0A0A'

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <header className="bg-bg-dark p-6 text-text-on-dark">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-caption uppercase tracking-wide text-text-on-dark/60">
              {project ? projectTypeLabel(project.project_type) : ''}
            </span>
          </div>
          <h1 className="mt-1 text-h1 font-bold">{project?.title}</h1>
          {project?.research_question && <p className="mt-1 text-body text-text-on-dark/80">{project.research_question}</p>}
        </header>
        <RibbonDivider color={accent} />
        <div className="p-6">
          <Outlet context={{ projectId }} />
        </div>
      </div>
    </div>
  )
}
