import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card } from '../../../components/ui/Card'
import { createProject } from '../api'
import { ProjectTypeSelect } from './ProjectTypeSelect'
import type { ProjectType } from '../../../types/database'

/**
 * Decisión UX 2 (aprobada): solo title + project_type son obligatorios acá.
 * description/research_question quedan para después, dentro del Workspace.
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
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-h1 font-bold">Create Project</h1>
      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-caption text-text-on-light">Título</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <label className="text-caption text-text-on-light">Qué estás creando</label>
            <div className="mt-1">
              <ProjectTypeSelect value={projectType} onChange={setProjectType} required />
            </div>
          </div>
          {mutation.isError && (
            <p className="text-caption text-state-error">
              {mutation.error instanceof Error ? mutation.error.message : 'No se pudo crear el proyecto.'}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending || !title || !projectType}>
            {mutation.isPending ? 'Creando...' : 'Create Project'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
