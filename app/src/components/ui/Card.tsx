import type { HTMLAttributes } from 'react'

/**
 * Card neutra (para Project, que no tiene color de entidad asignado en
 * DESIGN_SYSTEM.md — esa asignación es solo para Source/Document/Note/Claim).
 * Sin box-shadow difuso (regla explícita del Design System, sección 8.2).
 */
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-bg-dark/10 bg-bg-light p-6 ${className}`}
      {...props}
    />
  )
}
