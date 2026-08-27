import { useQuery } from '@tanstack/react-query'
import { useOutletContext } from 'react-router-dom'
import { getProjectCounts } from '../api'
import { InterlockStack } from '../../../components/ui/InterlockStack'
import { entityColor } from '../../../lib/design-tokens'

/**
 * Overview mínimo (brief §25): conteos reales de Sources/Documents/Notes/Claims,
 * conectados con Interlock — el único lugar de PARNASO donde "nada está
 * aislado" se hace literal (ver plan visual). Project Pulse adaptativo
 * completo ("N elementos sin conectar", señales de exploración) es Sprint 7
 * — no se inventa acá.
 */
export function OverviewTab() {
  const { projectId } = useOutletContext<{ projectId: string }>()
  const { data: counts } = useQuery({
    queryKey: ['project-counts', projectId],
    queryFn: () => getProjectCounts(projectId),
  })

  const tiles = [
    { key: 'first', label: 'Sources', value: counts?.sources, color: entityColor.source, radius: 'rounded-t-md' },
    { key: 'second', label: 'Documents', value: counts?.documents, color: entityColor.document, radius: '' },
    { key: 'third', label: 'Notes', value: counts?.notes, color: entityColor.note, radius: '' },
    { key: 'fourth', label: 'Claims', value: counts?.claims, color: entityColor.claim, radius: 'rounded-b-md' },
  ]

  return (
    <div className="max-w-xl">
      <InterlockStack>
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className={`flex items-center justify-between p-6 ${tile.radius}`}
            style={{ backgroundColor: `${tile.color}1A` }}
          >
            <div className="text-caption font-medium text-text-on-light">{tile.label}</div>
            <div className="text-display font-bold" style={{ color: tile.color }}>
              {tile.value ?? '–'}
            </div>
          </div>
        ))}
      </InterlockStack>
    </div>
  )
}
