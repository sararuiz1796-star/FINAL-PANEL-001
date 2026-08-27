import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listProjects } from '../api'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { signOut } from '../../auth/api'

const PROJECT_TYPE_LABELS: Record<string, string> = {
  journalism: 'Periodismo',
  book: 'Libro',
  novel: 'Novela',
  poetry_collection: 'Poemario',
  essay: 'Ensayo',
  documentary: 'Documental',
  screenplay: 'Guion',
  photo_series: 'Serie fotográfica',
  album: 'Álbum',
  exhibition: 'Exposición',
  artwork: 'Obra',
  design_project: 'Proyecto de diseño',
  academic_research: 'Investigación académica',
  artistic_research: 'Investigación artística',
  communication_project: 'Proyecto de comunicación',
  personal_research: 'Investigación personal',
  other: 'Otro',
}

export function ProjectList() {
  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: listProjects })

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-bold">PARNASO</h1>
        <div className="flex gap-2">
          <Link to="/projects/new">
            <Button>Create Project</Button>
          </Link>
          <Button variant="secondary" onClick={() => signOut()}>
            Salir
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && <Spinner />}
        {!isLoading && projects && projects.length === 0 && (
          <EmptyState message="Todavía no hay proyectos." />
        )}
        {!isLoading && projects && projects.length > 0 && (
          <div className="flex flex-col gap-2">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="transition-colors hover:border-bg-dark/30">
                  <h2 className="text-h2 font-semibold">{project.title}</h2>
                  <p className="mt-1 text-caption text-text-on-light">
                    {PROJECT_TYPE_LABELS[project.project_type] ?? project.project_type}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
