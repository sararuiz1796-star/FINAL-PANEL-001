import { Thread } from '../../../components/ui/Thread'
import { entityColor } from '../../../lib/design-tokens'

/**
 * Placeholder de Connections — el Thread es un diagrama con peso visual
 * real, no una lista vacía. Anticipa el mecanismo (Sprint 8) sin fingir
 * datos ni construir el grafo real todavía.
 */
export function ConnectionsPlaceholder() {
  return (
    <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
      <Thread
        points={[
          { label: 'Source', color: entityColor.source, x: 40, y: 170, r: 20 },
          { label: 'Document', color: entityColor.document, x: 160, y: 60, r: 30 },
          { label: 'Note', color: entityColor.note, x: 270, y: 150, r: 16 },
          { label: 'Claim', color: entityColor.claim, x: 370, y: 55, r: 26 },
        ]}
      />
      <p className="max-w-xs text-h2 font-semibold text-text-on-light">
        Acá vas a poder ver cómo se conectan las piezas de tu investigación.
        <span className="mt-2 block text-caption font-normal uppercase tracking-wide text-text-on-light/50">
          Se construye en Sprint 8
        </span>
      </p>
    </div>
  )
}
