interface ThreadPoint {
  label: string
  color: string
  x: number
  y: number
  r: number
}

/**
 * Diagrama de conexión — nodos de tamaño variado unidos en ángulo (no una
 * lista vertical recta), anticipando el mecanismo real de Connections
 * (Ref: hilo de rutina diaria, llevado a un diagrama con más peso visual,
 * sin tono wellness-app). Coordenadas fijas sobre un viewBox 400x220 —
 * es un diagrama del concepto, nunca datos inventados.
 */
export function Thread({ points }: { points: ThreadPoint[] }) {
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 400 220" className="w-full max-w-lg" role="img" aria-label="Diagrama de conexiones">
      <path d={path} fill="none" stroke="#0A0A0A" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="2 8" strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} />
          <text
            x={p.x}
            y={p.y - p.r - 10}
            textAnchor="middle"
            fontSize={13}
            fontWeight={600}
            fill="#0A0A0A"
            fontFamily="var(--font-sans)"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
