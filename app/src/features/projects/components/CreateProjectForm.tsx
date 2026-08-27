import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { createProject } from '../api'
import { TypeTileGrid } from './TypeTileGrid'
import type { ProjectType } from '../../../types/database'

/**
 * "¿Qué estás construyendo?", no "Complete este formulario". Título grande
 * como si se escribiera en una hoja en blanco, asimétrico (no centrado en
 * una card), casi manifiesto. El botón de crear aparece recién cuando
 * ambos campos están completos. Decisión UX 2 (aprobada): solo title +
 * project_type acá; description/research_question quedan para después,
 * dentro del Workspace.
 */
export function CreateProjectForm() {
  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState<ProjectType | ''>('')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => createProject({ title, project_type: projectType as ProjectType }),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title || !projectType) return
    mutation.mutate()
  }

  return (
    <div>
      <div className="bg-bg-dark p-4 md:p-6">
        <Link to="/" className="inline-flex items-center gap-1 text-caption text-text-on-dark/70">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl p-6 md:p-10">
        <div>
          <p className="text-h2 font-semibold uppercase tracking-tight text-text-on-light">¿Qué estás construyendo?</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribí el título..."
            autoFocus
            required
            className="mt-3 w-full border-b-4 border-bg-dark/15 bg-transparent pb-3 text-h1 font-bold leading-none text-text-on-light outline-none placeholder:text-bg-dark/20 focus:border-bg-dark md:text-display"
          />
        </div>

        <div className="mt-10">
          <TypeTileGrid value={projectType} onChange={setProjectType} />
        </div>

        {mutation.isError && (
          <p className="mt-6 text-caption text-state-error">
            {mutation.error instanceof Error ? mutation.error.message : 'No se pudo crear el proyecto.'}
          </p>
        )}

        {title && projectType && (
          <Button type="submit" disabled={mutation.isPending} className="mt-10">
            {mutation.isPending ? 'Creando...' : 'Create Project'}
          </Button>
        )}
      </form>
    </div>
  )
}
