import { useQuery } from '@tanstack/react-query'
import { pieceColor, pieceLabel, universeContrastText, universeColor } from '../../../../lib/universeTokens'
import { getPieceConnections, type Piece } from '../../universeApi'

interface PieceDetailSheetProps {
  piece: Piece
  projectId: string
  onClose: () => void
}

/** Hoja de detalle (handoff § 1.5) — cabecera con el color de la entidad, lista de conexiones cargada al abrir. */
export function PieceDetailSheet({ piece, projectId, onClose }: PieceDetailSheetProps) {
  const headerColor = pieceColor[piece.kind]
  const headerText = universeContrastText(headerColor)

  const { data: connections } = useQuery({
    queryKey: ['piece-connections', projectId, piece.kind, piece.id],
    queryFn: () => getPieceConnections(piece.kind, piece.id, projectId),
  })

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(12,11,10,.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden"
        style={{ backgroundColor: universeColor.cream, borderRadius: '30px 30px 0 0', maxHeight: '78%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pb-[18px] pt-4" style={{ backgroundColor: headerColor }}>
          <span className="whitespace-nowrap font-caption text-[10px] uppercase" style={{ color: headerText }}>
            {pieceLabel[piece.kind]} · {piece.codigo}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 px-3 py-1 font-caption text-[10px] uppercase"
            style={{ backgroundColor: universeColor.black, color: universeColor.cream, borderRadius: 12 }}
          >
            cerrar
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: 'calc(78vh - 60px)' }}>
          <h2 className="font-display text-[32px] leading-[1.02]" style={{ color: universeColor.black }}>
            {piece.titulo}
          </h2>
          <p className="mt-3 text-[14px] leading-[1.5]" style={{ color: universeColor.bodyOnCream }}>
            {piece.cuerpo}
          </p>

          <h3 className="mt-5 font-caption text-[10px] uppercase" style={{ color: universeColor.textMutedOnCream }}>
            Se conecta con
          </h3>
          <div className="mt-2 flex flex-col gap-1.5">
            {(connections ?? []).length === 0 && (
              <p className="font-caption text-[11px]" style={{ color: universeColor.textMutedOnCream }}>
                Todavía no tiene conexiones.
              </p>
            )}
            {connections?.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ backgroundColor: universeColor.creamElevated, borderRadius: '14px 6px 14px 6px' }}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: pieceColor[c.tipo] }} />
                <span className="text-[13px]" style={{ color: universeColor.black }}>
                  {c.texto}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="flex-1 py-2.5 font-caption text-[10px] uppercase"
              style={{ backgroundColor: universeColor.black, color: universeColor.cream, borderRadius: '18px 18px 6px 18px' }}
            >
              Conectar pieza
            </button>
            <button
              type="button"
              className="px-4 py-2.5 font-caption text-[10px] uppercase"
              style={{ border: `1px solid ${universeColor.black}`, color: universeColor.black, borderRadius: 18 }}
            >
              Citar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
