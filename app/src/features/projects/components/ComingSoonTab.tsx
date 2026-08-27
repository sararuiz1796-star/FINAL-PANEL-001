import type { LucideIcon } from 'lucide-react'

/**
 * Placeholder honesto para las pestañas que todavía no se construyen — no
 * finge datos ni funcionalidad, pero comparte el lenguaje visual (color +
 * ícono de la entidad) para que el Workspace se sienta consistente incluso
 * donde falta contenido real (Sprint 2-5).
 */
export function ComingSoonTab({ label, sprint, color, icon: Icon }: { label: string; sprint: string; color: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}26` }}
      >
        <Icon size={24} strokeWidth={2.5} color={color} />
      </div>
      <p className="text-body text-text-on-light">
        {label} se construye en {sprint}.
      </p>
    </div>
  )
}
