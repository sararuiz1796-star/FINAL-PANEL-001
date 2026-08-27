interface ThreadPoint {
  label: string
  color: string
  x: number
  y: number
  r: number
}

/**
 * Diagrama de conexión — nodos de tamaño variado, unidos por curvas (no
 * líneas rectas punteadas) y con superposición controlada entre alguno de
 * ellos, anticipando el mecanismo real de Connections como constelación,
 * no como un gráfico de nodos genérico. Coordenadas fijas sobre un viewBox
 * 400x220 — es un diagrama del concepto, nunca datos inventados.
 */
export function Thread({ points }: { points: ThreadPoint[] }) {
  const path = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const mx = (prev.x + p.x) / 2
    const my = (prev.y + p.y) / 2
    const dx = p.x - prev.x
    const dy = p.y - prev.y
    const len = Math.hypot(dx, dy) || 1
    const offset = i % 2 === 0 ? 26 : -26
    const cx = mx + (-dy / len) * offset
    const cy = my + (dx / len) * offset
    return `${d} Q ${cx} ${cy} ${p.x} ${p.y}`
  }, '')

  return (
    <svg viewBox="0 0 400 220" className="w-full max-w-lg" role="img" aria-label="Diagrama de conexiones">
      <path d={path} fill="none" stroke="#0A0A0A" strokeOpacity={0.2} strokeWidth={2} strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} stroke="#F5F2ED" strokeWidth={3} />
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
