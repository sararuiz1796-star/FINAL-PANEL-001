import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { listProjects } from '../api'
import { Spinner } from '../../../components/ui/Spinner'
import { signOut } from '../../auth/api'
import { projectTypeColor, projectTypeLabel } from '../../../lib/projectTypeGroups'
import { colorTokens } from '../../../lib/design-tokens'

/**
 * Home. Header en bloque negro con presencia real (título a escala hero +
 * el conteo de proyectos como número gráfico, no un dato al pie). "Create
 * Project" es negro sólido, no un color de familia — es una acción de
 * sistema, no una pieza de contenido (NEGRO = estructura, COLOR = entidad/
 * contenido, ver plan visual). Cada card de proyecto lleva un corte
 * diagonal de color por familia (lib/projectTypeGroups.ts) ocupando
 * superficie real, no una tira de acento — y las cards se tocan entre sí
 * (gap-px + borde compartido), pared de piezas conectadas, no lista con
 * padding.
 */
export function ProjectList() {
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: listProjects })
  const count = projects?.length ?? 0

  return (
    <div>
      <header className="flex items-start justify-between bg-bg-dark p-6 text-text-on-dark md:p-10">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-caption uppercase tracking-wide text-text-on-dark/50">PARNASO</p>
            <h1 className="text-display font-bold leading-none">Tu universo</h1>
          </div>
          {!isLoading && count > 0 && (
            <div className="hidden items-baseline gap-2 border-l border-text-on-dark/20 pl-6 sm:flex">
              <span className="font-bold leading-none" style={{ fontSize: 'var(--text-hero)', color: colorTokens.lime }}>
                {count}
              </span>
              <span className="pb-2 text-caption text-text-on-dark/60">{count === 1 ? 'proyecto' : 'proyectos'}</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex flex-shrink-0 items-center gap-1 rounded-sm border border-text-on-dark/20 px-4 py-2 text-caption text-text-on-dark"
        >
          <LogOut size={16} strokeWidth={2.5} />
          Salir
        </button>
      </header>

      <div className="grid grid-cols-1 gap-px bg-bg-dark/10 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/projects/new"
          className="flex min-h-48 flex-col items-start justify-between bg-bg-dark p-6 text-text-on-dark transition-opacity hover:opacity-90"
        >
          <Plus size={28} strokeWidth={2.5} color={colorTokens.lime} />
          <span className="text-h2 font-semibold">¿Qué estás construyendo?</span>
        </Link>

        {isLoading && (
          <div className="flex min-h-48 items-center justify-center bg-bg-light">
            <Spinner />
          </div>
        )}

        {!isLoading &&
          projects?.map((project) => {
            const color = projectTypeColor(project.project_type)
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="relative flex min-h-48 flex-col justify-between overflow-hidden bg-bg-light p-6 transition-opacity hover:opacity-90"
              >
                <div
                  className="absolute inset-y-0 left-0 w-2/5"
                  style={{ backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 55% 100%, 0 100%)' }}
                />
                <span className="relative ml-auto text-caption font-semibold uppercase tracking-wide text-text-on-light">
                  {projectTypeLabel(project.project_type)}
                </span>
                <h2 className="relative ml-auto text-right text-h2 font-bold leading-tight text-text-on-light">
                  {project.title}
                </h2>
              </Link>
            )
          })}
      </div>

      {!isLoading && projects && projects.length === 0 && (
        <p className="p-6 text-caption text-text-on-light md:p-10">Todavía no hay proyectos acá.</p>
      )}
    </div>
  )
}
