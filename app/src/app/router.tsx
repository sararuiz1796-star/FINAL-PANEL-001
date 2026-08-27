import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthed } from './RequireAuth'
import { AuthPage } from '../features/auth/components/AuthPage'
import { ProjectList } from '../features/projects/components/ProjectList'
import { CreateProjectForm } from '../features/projects/components/CreateProjectForm'
import { ProjectWorkspace } from '../features/projects/components/ProjectWorkspace'
import { OverviewTab } from '../features/projects/components/OverviewTab'
import { ComingSoonTab } from '../features/projects/components/ComingSoonTab'

/**
 * Auth → Home → Create Project → Project Workspace (alcance de este paso).
 * Sources/Documents/Notes/Claims/Connections reales son Sprint 2-8 — hoy
 * solo tienen ruta + placeholder para que la navegación del Sidebar no
 * rompa.
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
      { path: 'sources', element: <ComingSoonTab label="Sources" /> },
      { path: 'documents', element: <ComingSoonTab label="Documents" /> },
      { path: 'notes', element: <ComingSoonTab label="Notes" /> },
      { path: 'claims', element: <ComingSoonTab label="Claims" /> },
      { path: 'connections', element: <ComingSoonTab label="Connections" /> },
    ],
  },
])
