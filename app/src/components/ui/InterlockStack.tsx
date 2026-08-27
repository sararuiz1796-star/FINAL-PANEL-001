import type { ReactNode } from 'react'

/**
 * Pila vertical de bloques que se conectan entre sí mediante una muesca en
 * el punto de unión (Ref: cards de la app de running). Es el único lugar
 * de PARNASO donde "nada está aislado" se vuelve literal — no se repite en
 * listas ni en Home a propósito (ver plan visual).
 *
 * La muesca es un círculo del color de fondo de la página, apoyado sobre la
 * costura entre dos bloques contiguos — técnica simple y confiable en vez
 * de clip-path por bloque. Requiere que el fondo detrás de la pila sea
 * `bg-bg-light` (el mismo color del círculo) para que la ilusión funcione.
 */
export function InterlockStack({ children }: { children: ReactNode[] }) {
  return (
    <div className="flex flex-col">
      {children.map((child, i) => (
        <div key={i} className="relative">
          {child}
          {i < children.length - 1 && (
            <div className="absolute -bottom-2.5 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-bg-light" />
          )}
        </div>
      ))}
    </div>
  )
}
