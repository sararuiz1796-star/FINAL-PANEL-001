interface ThreadPoint {
  label: string
  color: string
}

/**
 * Hilo vertical con puntos — ilustra el mecanismo de Connections antes de
 * que exista el grafo real (Ref: línea de rutina diaria, sin el tono
 * wellness-app). Es un diagrama del concepto, nunca datos inventados.
 */
export function Thread({ points }: { points: ThreadPoint[] }) {
  return (
    <div className="relative flex flex-col gap-6 pl-2">
      <div className="absolute top-2 bottom-2 left-[7px] w-px bg-bg-dark/15" />
      {points.map((point) => (
        <div key={point.label} className="relative flex items-center gap-4">
          <div
            className="z-10 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-bg-light"
            style={{ backgroundColor: point.color }}
          />
          <span className="text-body text-text-on-light">{point.label}</span>
        </div>
      ))}
    </div>
  )
}
