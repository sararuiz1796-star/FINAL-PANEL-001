import { pieceColor, universeColor } from '../../../../lib/universeTokens'
import type { Constellation } from '../../universeApi'

interface ConstellationCardProps {
  constellation: Constellation
  onEnter: () => void
}

const VIEW_W = 330
const VIEW_H = 132

function layout(index: number, total: number): { x: number; y: number } {
  // Distribuye los nodos satélite en dos filas alrededor del centro — el
  // handoff fija coordenadas para su fixture; acá se generan a partir de
  // datos reales, así que se calculan proporcionalmente al viewBox.
  const cols = Math.max(total, 1)
  const x = 40 + (index * (VIEW_W - 80)) / Math.max(cols - 1, 1)
  const y = index % 2 === 0 ? 34 : 98
  return { x, y }
}

/** Constelación activa (handoff § 1.3) — diagrama de datos, no ilustración. */
export function ConstellationCard({ constellation, onEnter }: ConstellationCardProps) {
  const center = constellation.nodes[0]
  const satellites = constellation.nodes.slice(1)
  const positions = new Map<string, { x: number; y: number }>()
  positions.set(center.id, { x: VIEW_W / 2, y: VIEW_H / 2 })
  satellites.forEach((node, i) => positions.set(node.id, layout(i, satellites.length)))

  return (
    <section
      className="mx-3 mt-5 px-4 pb-3 pt-4"
      style={{ backgroundColor: universeColor.black, borderRadius: 28 }}
    >
      <div className="flex items-baseline justify-between font-caption text-[10px] uppercase">
        <span style={{ color: universeColor.textMutedOnBlack }}>Constelación activa</span>
        <span style={{ color: pieceColor.note }}>{constellation.threads} hilos</span>
      </div>

      <h2 className="mt-2 max-w-[250px] font-display text-[26px] leading-[1.05]" style={{ color: universeColor.cream }}>
        {constellation.headline.split(constellation.headlineAccent).map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <em className="italic" style={{ color: pieceColor.question }}>
                {constellation.headlineAccent}
              </em>
            )}
          </span>
        ))}
      </h2>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="mt-3 h-[132px] w-full" role="img" aria-label="Diagrama de conexiones activas">
        <style>
          {`@keyframes universe-pulse { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }`}
        </style>
        {constellation.edges.map((edge, i) => {
          const from = positions.get(edge.from)
          const to = positions.get(edge.to)
          if (!from || !to) return null
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={universeColor.lineOnBlack}
              strokeWidth={1}
              strokeDasharray={edge.tentative ? '3 4' : undefined}
            />
          )
        })}
        {satellites.map((node) => {
          const pos = positions.get(node.id)!
          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={node.r}
                fill={pieceColor[node.kind]}
                style={node.pulse ? { animation: 'universe-pulse 2.4s ease-in-out infinite' } : undefined}
              />
              <text
                x={pos.x}
                y={pos.y + node.r + 11}
                textAnchor="middle"
                fontFamily="var(--font-caption)"
                fontSize={8}
                fill={universeColor.textMutedOnBlack}
              >
                {node.label}
              </text>
            </g>
          )
        })}
        <circle cx={VIEW_W / 2} cy={VIEW_H / 2} r={center.r} fill={pieceColor.claim} />
        <text
          x={VIEW_W / 2}
          y={VIEW_H / 2 + center.r + 12}
          textAnchor="middle"
          fontFamily="var(--font-caption)"
          fontSize={9}
          fill={universeColor.textMutedOnBlack}
        >
          {center.label}
        </text>
      </svg>

      <button
        type="button"
        onClick={onEnter}
        className="mt-1 w-full py-[11px] font-caption text-[10px] uppercase"
        style={{ backgroundColor: universeColor.cream, color: universeColor.black, borderRadius: '6px 6px 20px 20px' }}
      >
        Entrar al mapa de conexiones
      </button>
    </section>
  )
}
