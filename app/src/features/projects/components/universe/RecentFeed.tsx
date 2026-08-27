import { pieceColor, pieceLabel, universeColor } from '../../../../lib/universeTokens'
import type { Piece } from '../../universeApi'

interface RecentFeedProps {
  pieces: Piece[]
  totalRecent: number
  filterLabel: string | null
  onOpen: (piece: Piece) => void
}

const ROW_RADII = ['18px 6px 18px 18px', '6px 20px 20px 20px', '20px 20px 6px 20px', '18px 18px 18px 6px']

/**
 * Feed "Movimiento reciente" (handoff § 1.4). El radio rotando por posición
 * entre cuatro valores es intencional: evita que las filas se vean
 * idénticas entre sí.
 */
export function RecentFeed({ pieces, totalRecent, filterLabel, onOpen }: RecentFeedProps) {
  const title = filterLabel ? `${filterLabel} recientes` : 'Movimiento reciente'

  return (
    <section className="px-5 pt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[30px]" style={{ color: universeColor.black }}>
          {title}
        </h2>
        <span className="font-caption text-[10px]" style={{ color: universeColor.textMutedOnCream }}>
          {pieces.length} / {totalRecent} recientes
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {pieces.length === 0 && (
          <p className="py-6 text-center font-caption text-[11px] uppercase" style={{ color: universeColor.textMutedOnCream }}>
            Todavía no hay piezas de este tipo.
          </p>
        )}
        {pieces.map((piece, i) => (
          <button
            key={piece.id}
            type="button"
            onClick={() => onOpen(piece)}
            className="flex items-stretch gap-3 p-3 text-left"
            style={{
              backgroundColor: universeColor.creamElevated,
              boxShadow: `0 1px 0 ${universeColor.lineOnCream}`,
              borderRadius: ROW_RADII[i % ROW_RADII.length],
            }}
          >
            <span className="w-2 shrink-0 self-stretch rounded-full" style={{ backgroundColor: pieceColor[piece.kind] }} />
            <span className="flex-1">
              <span
                className="flex items-baseline justify-between font-caption text-[9px] uppercase"
                style={{ color: universeColor.textMutedOnCream }}
              >
                <span>
                  {pieceLabel[piece.kind]} · {piece.codigo}
                </span>
                <span>{piece.cuando}</span>
              </span>
              <span
                className="mt-1 block text-[16px] leading-[1.25] font-medium"
                style={{ color: universeColor.black, textWrap: 'pretty' }}
              >
                {piece.titulo}
              </span>
              <span className="mt-1.5 flex gap-1.5 font-caption text-[9px]">
                <span
                  className="px-2 py-0.5"
                  style={{ border: `1px solid ${universeColor.black}`, borderRadius: 12, color: universeColor.black }}
                >
                  {piece.enlaces} {piece.enlaces === 1 ? 'conexión' : 'conexiones'}
                </span>
                <span
                  className="px-2 py-0.5"
                  style={{ backgroundColor: universeColor.creamSunken, borderRadius: 12, color: universeColor.black }}
                >
                  {piece.etiqueta}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
