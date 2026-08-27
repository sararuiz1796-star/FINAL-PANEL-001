import type { ReactNode } from 'react'
import { contrastTextColor } from '../../../lib/design-tokens'

type ComingSoonKind = 'nodes' | 'stack' | 'fragments' | 'frame'

interface ComingSoonTabProps {
  label: string
  sprint: string
  color: string
  kind: ComingSoonKind
}

/**
 * Placeholder honesto para las pestañas que todavía no se construyen — cada
 * una con una composición de forma propia que insinúa la naturaleza de la
 * entidad (no la misma plantilla "rectángulo + ícono" repetida cuatro
 * veces):
 * - Sources  → nodos superpuestos (colección/red).
 * - Documents → páginas apiladas con offset (objetos/piezas).
 * - Notes    → fragmentos rotados y superpuestos (anotación/capas).
 * - Claims   → marco tipográfico contundente sin relleno (afirmación).
 */
export function ComingSoonTab({ label, sprint, color, kind }: ComingSoonTabProps) {
  const text = contrastTextColor(color)

  // Los motivos van en el color de contraste (blanco/negro), no en `color` —
  // si no, quedan invisibles contra el fondo sólido del mismo color.
  let visual: ReactNode
  if (kind === 'nodes') {
    visual = (
      <div className="relative h-32 w-full">
        <div className="absolute left-6 top-4 h-20 w-20 rounded-full opacity-20" style={{ backgroundColor: text }} />
        <div className="absolute left-16 top-10 h-16 w-16 rounded-full opacity-40" style={{ backgroundColor: text }} />
        <div className="absolute left-28 top-2 h-10 w-10 rounded-full opacity-80" style={{ backgroundColor: text }} />
      </div>
    )
  } else if (kind === 'stack') {
    visual = (
      <div className="relative h-32 w-40">
        <div className="absolute left-4 top-8 h-24 w-32 opacity-20" style={{ backgroundColor: text }} />
        <div className="absolute left-2 top-4 h-24 w-32 opacity-40" style={{ backgroundColor: text }} />
        <div className="absolute left-0 top-0 h-24 w-32 opacity-80" style={{ backgroundColor: text }} />
      </div>
    )
  } else if (kind === 'fragments') {
    visual = (
      <div className="relative h-32 w-44">
        <div className="absolute left-2 top-6 h-14 w-28 -rotate-6 opacity-20" style={{ backgroundColor: text }} />
        <div className="absolute left-10 top-0 h-14 w-28 rotate-3 opacity-80" style={{ backgroundColor: text }} />
        <div className="absolute left-4 top-16 h-10 w-20 rotate-12 opacity-40" style={{ backgroundColor: text }} />
      </div>
    )
  } else {
    visual = (
      <div className="flex h-32 w-full items-center border-4 px-6" style={{ borderColor: color }}>
        <span className="text-h1 font-bold leading-none" style={{ color }}>
          &ldquo;
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex min-h-56 flex-col justify-between p-6" style={kind === 'frame' ? undefined : { backgroundColor: color }}>
        {visual}
        <span
          className="text-display font-bold leading-none"
          style={{ color: kind === 'frame' ? undefined : text }}
        >
          {label}
        </span>
      </div>
      <p className="mt-4 text-body text-text-on-light">Todavía no está construido — llega en {sprint}.</p>
    </div>
  )
}
