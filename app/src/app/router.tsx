import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthed } from './RequireAuth'
import { AuthPage } from '../features/auth/components/AuthPage'
import { ProjectList } from '../features/projects/components/ProjectList'
import { CreateProjectForm } from '../features/projects/components/CreateProjectForm'
import { ProjectWorkspace } from '../features/projects/components/ProjectWorkspace'
import { UniverseScreen } from '../features/projects/components/universe/UniverseScreen'
import { UniversePlaceholder } from '../features/projects/components/universe/UniversePlaceholder'

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
      { index: true, element: <UniverseScreen /> },
      { path: 'mapa', element: <UniversePlaceholder label="Mapa de conexiones" /> },
      { path: 'buscar', element: <UniversePlaceholder label="Buscar" /> },
      { path: 'yo', element: <UniversePlaceholder label="Yo" /> },
    ],
  },
])
