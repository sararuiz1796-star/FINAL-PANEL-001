import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthed } from './RequireAuth'
import { AuthPage } from '../features/auth/components/AuthPage'
import { ProjectList } from '../features/projects/components/ProjectList'
import { CreateProjectForm } from '../features/projects/components/CreateProjectForm'
import { ProjectWorkspace } from '../features/projects/components/ProjectWorkspace'
import { OverviewTab } from '../features/projects/components/OverviewTab'
import { ComingSoonTab } from '../features/projects/components/ComingSoonTab'
import { ConnectionsPlaceholder } from '../features/projects/components/ConnectionsPlaceholder'
import { entityColor } from '../lib/design-tokens'

/**
 * Auth → Home → Create Project → Project Workspace (alcance de este paso).
 * Sources/Documents/Notes/Claims reales son Sprint 2-5, Connections real es
 * Sprint 8 — hoy solo tienen ruta + placeholder consistente visualmente.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthed>
        <AuthPage />
      </RedirectIfAuthed>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <ProjectList />
      </RequireAuth>
    ),
  },
  {
    path: '/projects/new',
    element: (
      <RequireAuth>
        <CreateProjectForm />
      </RequireAuth>
    ),
  },
  {
    path: '/projects/:projectId',
    element: (
      <RequireAuth>
        <ProjectWorkspace />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <OverviewTab /> },
      { path: 'sources', element: <ComingSoonTab label="Sources" sprint="Sprint 2" color={entityColor.source} kind="nodes" /> },
      {
        path: 'documents',
        element: <ComingSoonTab label="Documents" sprint="Sprint 3" color={entityColor.document} kind="stack" />,
      },
      { path: 'notes', element: <ComingSoonTab label="Notes" sprint="Sprint 4" color={entityColor.note} kind="fragments" /> },
      {
        path: 'claims',
        element: <ComingSoonTab label="Claims" sprint="Sprint 5" color={entityColor.claim} kind="frame" />,
      },
      { path: 'connections', element: <ConnectionsPlaceholder /> },
    ],
  },
])
