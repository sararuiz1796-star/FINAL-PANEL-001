import type { ProjectType } from '../../../types/database'

/**
 * Selector agrupado — decisión UX 3 (docs/HANDOFF_PRODUCT_UX.md §3): agrupa
 * los 17 valores existentes por familia semántica, sin eliminar ninguno y
 * sin mezclar conceptos que no van juntos (un álbum es Música, no Audiovisual).
 * Orden fijo, sin personalización por Creator Profile todavía.
 */
const PROJECT_TYPE_GROUPS: { label: string; options: { value: ProjectType; label: string }[] }[] = [
  {
    label: 'Texto',
    options: [
      { value: 'book', label: 'Libro' },
      { value: 'novel', label: 'Novela' },
      { value: 'poetry_collection', label: 'Poemario' },
      { value: 'essay', label: 'Ensayo' },
    ],
  },
  {
    label: 'Audiovisual',
    options: [
      { value: 'documentary', label: 'Documental' },
      { value: 'screenplay', label: 'Guion' },
    ],
  },
  {
    label: 'Visual / Diseño',
    options: [
      { value: 'photo_series', label: 'Serie fotográfica' },
      { value: 'exhibition', label: 'Exposición' },
      { value: 'artwork', label: 'Obra' },
      { value: 'design_project', label: 'Proyecto de diseño' },
    ],
  },
  {
    label: 'Música',
    options: [{ value: 'album', label: 'Álbum' }],
  },
  {
    label: 'Investigación / Comunicación',
    options: [
      { value: 'journalism', label: 'Periodismo' },
      { value: 'academic_research', label: 'Investigación académica' },
      { value: 'artistic_research', label: 'Investigación artística' },
      { value: 'communication_project', label: 'Proyecto de comunicación' },
      { value: 'personal_research', label: 'Investigación personal' },
    ],
  },
  {
    label: 'Otro',
    options: [{ value: 'other', label: 'Otro' }],
  },
]

interface ProjectTypeSelectProps {
  value: ProjectType | ''
  onChange: (value: ProjectType) => void
  required?: boolean
}

export function ProjectTypeSelect({ value, onChange, required }: ProjectTypeSelectProps) {
  return (
    <select
      className="w-full rounded-sm border border-bg-dark/10 bg-bg-light px-2 py-2 text-body text-text-on-light outline-none focus:border-bg-dark/40"
      value={value}
      onChange={(e) => onChange(e.target.value as ProjectType)}
      required={required}
    >
      <option value="" disabled>
        Elegí qué estás creando
      </option>
      {PROJECT_TYPE_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
