import {
  LayoutGrid,
  Users,
  FileText,
  StickyNote,
  MessageSquareQuote,
  Share2,
  type LucideIcon,
} from 'lucide-react'

/**
 * Ítems del sidebar de Research Workspace, como configuración de datos —
 * no hardcodeados por componente (ver docs/ARCHITECTURE.md §6 y
 * docs/HANDOFF_PRODUCT_UX.md, decisión 1).
 *
 * Este orden es el default aprobado para el MVP, no una jerarquía fija:
 * la personalización por Creator Profile / Project Type / Creative Context
 * (docs/CREATIVE_CONTEXT.md) se resuelve después leyendo/reordenando esta
 * misma lista — nunca reescribiendo Sidebar/Topbar.
 *
 * "Connections" no es una entidad de contenido más: representa la capacidad
 * transversal del producto ("nada está aislado"). Sigue apareciendo acá
 * porque también necesita una pantalla propia, pero cualquier detalle de
 * entidad debe poder crear/ver relaciones directamente, sin pasar por acá.
 */
export type NavEntityType = 'overview' | 'source' | 'document' | 'note' | 'claim' | 'connections'

export interface NavItem {
  key: NavEntityType
  label: string
  icon: LucideIcon
  path: string
  order: number
}

export const workspaceNavItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid, path: '', order: 0 },
  { key: 'source', label: 'Sources', icon: Users, path: 'sources', order: 1 },
  { key: 'document', label: 'Documents', icon: FileText, path: 'documents', order: 2 },
  { key: 'note', label: 'Notes', icon: StickyNote, path: 'notes', order: 3 },
  { key: 'claim', label: 'Claims', icon: MessageSquareQuote, path: 'claims', order: 4 },
  { key: 'connections', label: 'Connections', icon: Share2, path: 'connections', order: 5 },
]
