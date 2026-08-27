import type { ProjectType } from '../types/database'
import { colorTokens } from './design-tokens'

/**
 * Familia visual + color por `project_type`. Vive acá, como configuración,
 * por la misma razón que `lib/navigation.ts`: cuando exista personalización
 * real por Creator Profile, remapear esto es editar datos, no reescribir
 * componentes (ProjectList, CreateProjectForm, ProjectTypeSelect ya solo
 * leen de este archivo).
 *
 * Los colores de familia NO son colores de entidad (esos son fijos:
 * Source=morado, Document=naranja, Note=lima, Claim=celeste). Project no
 * tiene un color de entidad asignado en DESIGN_SYSTEM.md — reutilizamos la
 * misma paleta de bloques (sección 2) para diferenciar familias sin crear
 * un sistema de color nuevo.
 */

export type ProjectTypeGroupKey = 'texto' | 'audiovisual' | 'visual' | 'musica' | 'investigacion' | 'otro'

export const PROJECT_TYPE_GROUP_META: Record<ProjectTypeGroupKey, { label: string; color: string }> = {
  texto: { label: 'Texto', color: colorTokens.sky },
  audiovisual: { label: 'Audiovisual', color: colorTokens.pink },
  visual: { label: 'Visual / Diseño', color: colorTokens.purple },
  musica: { label: 'Música', color: colorTokens.lime },
  investigacion: { label: 'Investigación / Comunicación', color: colorTokens.orange },
  otro: { label: 'Otro', color: colorTokens.bgDark },
}

interface ProjectTypeMeta {
  label: string
  group: ProjectTypeGroupKey
}

export const PROJECT_TYPE_META: Record<ProjectType, ProjectTypeMeta> = {
  book: { label: 'Libro', group: 'texto' },
  novel: { label: 'Novela', group: 'texto' },
  poetry_collection: { label: 'Poemario', group: 'texto' },
  essay: { label: 'Ensayo', group: 'texto' },
  documentary: { label: 'Documental', group: 'audiovisual' },
  screenplay: { label: 'Guion', group: 'audiovisual' },
  photo_series: { label: 'Serie fotográfica', group: 'visual' },
  exhibition: { label: 'Exposición', group: 'visual' },
  artwork: { label: 'Obra', group: 'visual' },
  design_project: { label: 'Proyecto de diseño', group: 'visual' },
  album: { label: 'Álbum', group: 'musica' },
  journalism: { label: 'Periodismo', group: 'investigacion' },
  academic_research: { label: 'Investigación académica', group: 'investigacion' },
  artistic_research: { label: 'Investigación artística', group: 'investigacion' },
  communication_project: { label: 'Proyecto de comunicación', group: 'investigacion' },
  personal_research: { label: 'Investigación personal', group: 'investigacion' },
  other: { label: 'Otro', group: 'otro' },
}

export function projectTypeColor(type: ProjectType): string {
  return PROJECT_TYPE_GROUP_META[PROJECT_TYPE_META[type].group].color
}

export function projectTypeLabel(type: ProjectType): string {
  return PROJECT_TYPE_META[type]?.label ?? type
}

/** Grupos en orden fijo, para armar la grilla de Create Project. */
export const PROJECT_TYPE_GROUPS_ORDERED: ProjectTypeGroupKey[] = [
  'texto',
  'audiovisual',
  'visual',
  'musica',
  'investigacion',
  'otro',
]

export function typesInGroup(group: ProjectTypeGroupKey): ProjectType[] {
  return (Object.keys(PROJECT_TYPE_META) as ProjectType[]).filter((t) => PROJECT_TYPE_META[t].group === group)
}
