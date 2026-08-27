import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { listProjects } from '../api'
import { Spinner } from '../../../components/ui/Spinner'
import { signOut } from '../../auth/api'
import { projectTypeColor, projectTypeLabel } from '../../../lib/projectTypeGroups'
import { colorTokens } from '../../../lib/design-tokens'
import { ProjectPiece, type PieceVariant } from './ProjectPiece'

const VARIANTS: PieceVariant[] = ['block', 'tab', 'flag', 'frame']

/**
 * Home. Header en bloque negro con presencia real (título a escala hero +
 * el conteo de proyectos como número gráfico). "Create Project" es negro
 * sólido — es una acción de sistema, no una pieza de contenido. Los
 * proyectos rotan entre 4 siluetas de pieza (ProjectPiece) por posición —
 * no una card repetida con un acento — y el primero ocupa doble columna en
 * desktop para romper la monotonía de grilla uniforme.
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
          className="relative flex min-h-48 flex-col justify-between bg-bg-dark p-6 pt-10 text-text-on-dark transition-opacity hover:opacity-90"
        >
          <span
            className="absolute -top-3 left-6 rounded-full px-4 py-1 text-caption font-semibold uppercase tracking-wide"
            style={{ backgroundColor: colorTokens.lime, color: colorTokens.bgDark }}
          >
            Nuevo
          </span>
          <Plus size={28} strokeWidth={2.5} color={colorTokens.lime} />
          <span className="text-h2 font-semibold">¿Qué estás construyendo?</span>
        </Link>

        {isLoading && (
          <div className="flex min-h-48 items-center justify-center bg-bg-light">
            <Spinner />
          </div>
        )}

        {!isLoading &&
          projects?.map((project, i) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="transition-opacity hover:opacity-90">
              <ProjectPiece
                title={project.title}
                familyLabel={projectTypeLabel(project.project_type)}
                color={projectTypeColor(project.project_type)}
                variant={VARIANTS[i % VARIANTS.length]}
                className={i === 0 ? 'lg:col-span-2' : ''}
              />
            </Link>
          ))}
      </div>

      {!isLoading && projects && projects.length === 0 && (
        <p className="p-6 text-caption text-text-on-light md:p-10">Todavía no hay proyectos acá.</p>
      )}
    </div>
  )
}
