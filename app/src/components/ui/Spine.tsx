import type { ReactNode } from 'react'

/**
 * Lomo de color a la izquierda — diferencia familias de proyecto en Home
 * sin convertir cada disciplina en una mini-app (Ref: cintas del D&AD,
 * reducidas a su gesto mínimo: un borde, no un bloque completo).
 */
export function Spine({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-bg-dark/10">
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 bg-bg-light p-4">{children}</div>
    </div>
  )
}
