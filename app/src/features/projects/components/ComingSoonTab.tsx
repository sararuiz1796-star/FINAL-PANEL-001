import type { LucideIcon } from 'lucide-react'
import { contrastTextColor } from '../../../lib/design-tokens'

/**
 * Placeholder honesto para las pestañas que todavía no se construyen — no
 * finge datos ni funcionalidad, pero comparte el lenguaje visual (bloque
 * de color sólido de la entidad, no un ícono chico centrado) para que el
 * Workspace se sienta consistente incluso donde falta contenido real
 * (Sprint 2-5).
 */
export function ComingSoonTab({ label, sprint, color, icon: Icon }: { label: string; sprint: string; color: string; icon: LucideIcon }) {
  const text = contrastTextColor(color)
  return (
    <div>
      <div className="flex min-h-40 flex-col justify-between p-6" style={{ backgroundColor: color }}>
        <Icon size={32} strokeWidth={2.5} color={text} />
        <span className="text-display font-bold leading-none" style={{ color: text }}>
          {label}
        </span>
      </div>
      <p className="mt-4 text-body text-text-on-light">
        Todavía no está construido — llega en {sprint}.
      </p>
    </div>
  )
}
