import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { getProjectCounts } from '../api'
import { Card } from '../../../components/ui/Card'
import { entityColor } from '../../../lib/design-tokens'

/**
 * Overview mínimo (brief §25): conteos reales de Sources/Documents/Notes/Claims.
 * Project Pulse adaptativo completo (señales, "elementos sin conectar", lenguaje
 * de exploración) es Sprint 7 — acá solo los conteos base, sin ese layer todavía.
 */
export function OverviewTab() {
  const { projectId } = useOutletContext<{ projectId: string }>()
  const { data: counts } = useQuery({
    queryKey: ['project-counts', projectId],
    queryFn: () => getProjectCounts(projectId),
  })

  const tiles = [
    { label: 'Sources', value: counts?.sources, color: entityColor.source },
    { label: 'Documents', value: counts?.documents, color: entityColor.document },
    { label: 'Notes', value: counts?.notes, color: entityColor.note },
    { label: 'Claims', value: counts?.claims, color: entityColor.claim },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} style={{ backgroundColor: `${tile.color}1A` }}>
          <div className="text-display font-bold" style={{ color: tile.color }}>
            {tile.value ?? '–'}
          </div>
          <div className="mt-1 text-caption text-text-on-light">{tile.label}</div>
        </Card>
      ))}
    </div>
  )
}
