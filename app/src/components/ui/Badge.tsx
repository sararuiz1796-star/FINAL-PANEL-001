import { contrastTextColor } from '../../lib/design-tokens'

/** Píldora — DESIGN_SYSTEM.md §5: color sólido, nunca pastel; texto de alto contraste (blanco o negro según el color base). */
export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-caption font-medium"
      style={{ backgroundColor: color, color: contrastTextColor(color) }}
    >
      {label}
    </span>
  )
}
