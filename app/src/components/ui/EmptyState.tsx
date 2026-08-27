/** DESIGN_SYSTEM.md §6 — texto corto y directo, sin tono motivacional. */
export function EmptyState({ message, accentColor = '#0A0A0A' }: { message: string; accentColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="h-16 w-16 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.15 }} />
      <p className="text-body text-text-on-light">{message}</p>
    </div>
  )
}
