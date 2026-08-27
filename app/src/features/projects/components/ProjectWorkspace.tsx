import { Outlet, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '../api'
import { Sidebar } from '../../../components/layout/Sidebar'
import { Spinner } from '../../../components/ui/Spinner'
import { RibbonDivider, RibbonTag } from '../../../components/ui/Ribbon'
import { projectTypeColor, projectTypeLabel } from '../../../lib/projectTypeGroups'

/**
 * Shell del Research Workspace: header de proyecto + Sidebar + contenido de
 * la pestaña activa (Outlet). El header tiene presencia real (título a
 * escala display, no h1) y el RibbonDivider actúa como el "enchufe"
 * arquitectónico entre la estructura (negro) y el mecanismo de color de
 * Overview — no una cinta decorativa delgada.
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
        <header className="bg-bg-dark p-6 pb-10 text-text-on-dark md:p-10 md:pb-12">
          {project && <RibbonTag label={projectTypeLabel(project.project_type)} color={accent} />}
          <h1 className="mt-4 text-display font-bold leading-none">{project?.title}</h1>
          {project?.research_question && (
            <p className="mt-3 max-w-xl text-body text-text-on-dark/70">{project.research_question}</p>
          )}
        </header>
        <RibbonDivider color={accent} />
        <div className="p-6 md:p-10">
          <Outlet context={{ projectId }} />
        </div>
      </div>
    </div>
  )
}
