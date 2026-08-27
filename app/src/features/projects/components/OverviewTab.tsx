import { useQuery } from '@tanstack/react-query'
import { Link, useOutletContext } from 'react-router-dom'
import { getProjectCounts } from '../api'
import { Notch } from '../../../components/ui/Notch'
import { entityColor, contrastTextColor } from '../../../lib/design-tokens'

/**
 * Overview — la pieza visual más fuerte de PARNASO (plan visual). Sources/
 * Documents/Notes/Claims no son 4 rectángulos iguales: es una composición
 * asimétrica tipo pinwheel (Sources grande a la izquierda, Documents/Notes
 * apilados a la derecha, Claims como franja completa abajo), en color
 * sólido a opacidad completa (DESIGN_SYSTEM.md §5 ya permite esta opción),
 * con los números en --text-hero — el número es el elemento gráfico
 * dominante, no un dato al costado del label.
 *
 * Cada pieza es un Link real a su ruta (Sources/Documents/Notes/Claims) —
 * el bloque es grande y de color sólido, pero sigue siendo evidente que es
 * navegación: cursor, hover, y el label siempre en la esquina superior,
 * nunca compitiendo con el número.
 *
 * Project Pulse adaptativo completo ("N elementos sin conectar") es
 * Sprint 7 — no se inventa acá.
 */
export function OverviewTab() {
  const { projectId } = useOutletContext<{ projectId: string }>()
  const { data: counts } = useQuery({
    queryKey: ['project-counts', projectId],
    queryFn: () => getProjectCounts(projectId),
  })

  const tileBase =
    'group relative flex flex-col justify-between overflow-hidden p-6 transition-transform hover:brightness-110 min-h-40'

  function Tile({
    to,
    label,
    value,
    color,
    className = '',
    notch = false,
  }: {
    to: string
    label: string
    value: number | undefined
    color: string
    className?: string
    notch?: boolean
  }) {
    const text = contrastTextColor(color)
    return (
      <Link to={to} className={`${tileBase} ${className}`} style={{ backgroundColor: color }}>
        {notch && <Notch className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />}
        <span className="text-caption font-semibold uppercase tracking-wide" style={{ color: text }}>
          {label}
        </span>
        <span
          className="-mb-2 -mr-1 self-end font-bold leading-none"
          style={{ color: text, fontSize: 'var(--text-hero)' }}
        >
          {value ?? '–'}
        </span>
      </Link>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-0 md:grid-cols-[3fr_2fr]">
      <Tile
        to="sources"
        label="Sources"
        value={counts?.sources}
        color={entityColor.source}
        className="md:row-span-2"
      />
      <Tile to="documents" label="Documents" value={counts?.documents} color={entityColor.document} />
      <Tile to="notes" label="Notes" value={counts?.notes} color={entityColor.note} notch />
      <Tile
        to="claims"
        label="Claims"
        value={counts?.claims}
        color={entityColor.claim}
        className="md:col-span-2"
        notch
      />
    </div>
  )
}
