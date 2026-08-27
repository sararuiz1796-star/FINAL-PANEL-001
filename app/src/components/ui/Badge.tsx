/** Píldora — DESIGN_SYSTEM.md §5: color sólido, nunca pastel; texto de alto contraste (blanco o negro según el color base). */
function contrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0A0A0A' : '#FFFFFF'
}

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
