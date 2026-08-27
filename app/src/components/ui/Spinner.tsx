/** DESIGN_SYSTEM.md §6 — skeleton/loading en el color de bloque de la sección, no gris genérico. */
export function Spinner({ color = '#0A0A0A' }: { color?: string }) {
  return (
    <div
      className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
      style={{ borderColor: color, borderTopColor: 'transparent' }}
    />
  )
}
