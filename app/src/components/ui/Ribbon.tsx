import type { ReactNode } from 'react'

/**
 * Divisor en ángulo entre header y body — recurso puntual (Ref: cintas del
 * D&AD Festival, traducidas sin fondo negro ni ilustración de archivo).
 * Nunca decorativo solo: marca "entraste a otra zona" (Workspace vs Home).
 */
export function RibbonDivider({ color }: { color: string }) {
  return (
    <div
      className="h-3 w-full"
      style={{ backgroundColor: color, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 40%, 0 100%)' }}
    />
  )
}

/** Tag inline en paralelogramo — tipo/procedencia en filas de lista, nunca un badge redondo genérico. */
export function RibbonTag({ label, color, textColor = '#FFFFFF' }: { label: ReactNode; color: string; textColor?: string }) {
  return (
    <span
      className="inline-flex items-center px-4 py-1 text-caption font-medium"
      style={{ backgroundColor: color, color: textColor, clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)' }}
    >
      {label}
    </span>
  )
}
