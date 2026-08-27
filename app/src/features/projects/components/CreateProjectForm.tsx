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
 * como si se escribiera en una hoja en blanco (no un input con label
 * encima); el botón de crear aparece recién cuando ambos campos están
 * completos, para que el momento se sienta rápido, no como un onboarding.
 * Decisión UX 2 (aprobada): solo title + project_type acá; description/
 * research_question quedan para después, dentro del Workspace.
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
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-caption text-text-on-light">
        <ArrowLeft size={16} strokeWidth={2.5} />
        Volver
      </Link>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-10">
        <div>
          <p className="text-caption font-medium uppercase tracking-wide text-text-on-light">
            ¿Qué estás construyendo?
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribí el título de tu proyecto..."
            autoFocus
            required
            className="mt-2 w-full border-b-2 border-bg-dark/15 bg-transparent pb-2 text-h1 font-bold text-text-on-light outline-none placeholder:text-bg-dark/25 focus:border-bg-dark"
          />
        </div>

        <TypeTileGrid value={projectType} onChange={setProjectType} />

        {mutation.isError && (
          <p className="text-caption text-state-error">
            {mutation.error instanceof Error ? mutation.error.message : 'No se pudo crear el proyecto.'}
          </p>
        )}

        {title && projectType && (
          <Button type="submit" disabled={mutation.isPending} className="self-start">
            {mutation.isPending ? 'Creando...' : 'Create Project'}
          </Button>
        )}
      </form>
    </div>
  )
}
