import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { listProjects } from '../api'
import { Spinner } from '../../../components/ui/Spinner'
import { Spine } from '../../../components/ui/Spine'
import { signOut } from '../../auth/api'
import { projectTypeColor, projectTypeLabel } from '../../../lib/projectTypeGroups'

/**
 * Home. Header en bloque oscuro (coherente con el Sidebar del Workspace).
 * "Create Project" no es un botón de toolbar arriba a la derecha — es la
 * primera tile de la grilla: empezar un proyecto es parte del universo, no
 * una acción administrativa. Cada card de proyecto lleva su Spine por
 * familia (ver lib/projectTypeGroups.ts) en vez del enum crudo.
 */
export function ProjectList() {
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: listProjects })

  return (
    <div>
      <header className="flex items-center justify-between bg-bg-dark p-6 text-text-on-dark">
        <div>
          <p className="text-caption uppercase tracking-wide text-text-on-dark/60">PARNASO</p>
          <h1 className="text-h1 font-bold">Tu universo</h1>
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1 rounded-sm border border-text-on-dark/20 px-4 py-2 text-caption text-text-on-dark"
        >
          <LogOut size={16} strokeWidth={2.5} />
          Salir
        </button>
      </header>

      <div className="mx-auto max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/projects/new"
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-bg-dark/20 text-text-on-light transition-colors hover:border-bg-dark/40"
          >
            <Plus size={24} strokeWidth={2.5} />
            <span className="text-body font-medium">¿Qué estás construyendo?</span>
          </Link>

          {isLoading && (
            <div className="flex min-h-32 items-center justify-center">
              <Spinner />
            </div>
          )}
          {!isLoading &&
            projects?.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Spine color={projectTypeColor(project.project_type)}>
                  <h2 className="text-h2 font-semibold">{project.title}</h2>
                  <p className="mt-1 text-caption text-text-on-light">{projectTypeLabel(project.project_type)}</p>
                </Spine>
              </Link>
            ))}
        </div>

        {!isLoading && projects && projects.length === 0 && (
          <p className="mt-6 text-caption text-text-on-light">Todavía no hay proyectos acá.</p>
        )}
      </div>
    </div>
  )
}
