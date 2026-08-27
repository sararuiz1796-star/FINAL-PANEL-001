import { Thread } from '../../../components/ui/Thread'
import { entityColor } from '../../../lib/design-tokens'

/**
 * Placeholder de Connections — no es "coming soon" plano: el Thread ilustra
 * el mecanismo (qué se va a poder conectar) sin inventar datos ni construir
 * el grafo real todavía (Sprint 8).
 */
export function ConnectionsPlaceholder() {
  return (
    <div className="max-w-md py-10">
      <Thread
        points={[
          { label: 'Source', color: entityColor.source },
          { label: 'Document', color: entityColor.document },
          { label: 'Note', color: entityColor.note },
          { label: 'Claim', color: entityColor.claim },
        ]}
      />
      <p className="mt-8 text-body text-text-on-light">
        Acá vas a poder ver cómo se conectan las piezas de tu investigación. Se construye en Sprint 8.
      </p>
    </div>
  )
}
