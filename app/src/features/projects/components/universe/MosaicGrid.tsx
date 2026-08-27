import type { PieceKind } from '../../../../lib/universeTokens'

interface MosaicTile {
  kind: PieceKind
  label: string
  value: number
  detail?: string
  span: string
  radius: string
  bg: string
  fg: string
  numberSize: string
  labelAccent?: string
}

interface MosaicGridProps {
  counts: Record<PieceKind, number>
  claimsNeedingEvidence: number
  activeFilter: PieceKind | null
  onSelect: (kind: PieceKind) => void
  onClear: () => void
  recentCount: number
  totalRecent: number
}

/**
 * Mosaico de masas (handoff § 1.2) — el corazón de la pantalla. Cada tile
 * es una superficie de color grande con un número sobredimensionado, no
 * una tarjeta con ícono; radios asimétricos por tile, sin normalizar a un
 * solo valor (regla explícita del handoff).
 */
export function MosaicGrid({
  counts,
  claimsNeedingEvidence,
  activeFilter,
  onSelect,
  onClear,
  recentCount,
  totalRecent,
}: MosaicGridProps) {
  const tiles: MosaicTile[] = [
    {
      kind: 'source',
      label: 'Fuentes',
      value: counts.source,
      detail: 'negativos, audios, recortes de prensa',
      span: 'col-span-2 row-span-2',
      radius: '22px 22px 6px 22px',
      bg: '#1B3CFF',
      fg: '#F2E9DA',
      numberSize: 'text-[72px]',
    },
    {
      kind: 'note',
      label: 'Notas',
      value: counts.note,
      span: '',
      radius: '6px 22px 6px 22px',
      bg: '#C6F24E',
      fg: '#0C0B0A',
      numberSize: 'text-[38px]',
    },
    {
      kind: 'idea',
      label: 'Ideas',
      value: counts.idea,
      span: '',
      radius: '22px 6px 22px 6px',
      bg: '#0C0B0A',
      fg: '#F2E9DA',
      labelAccent: '#E8318E',
      numberSize: 'text-[38px]',
    },
    {
      kind: 'claim',
      label: 'Afirmaciones',
      value: counts.claim,
      detail: claimsNeedingEvidence > 0 ? `${claimsNeedingEvidence} sin evidencia` : undefined,
      span: 'col-span-2',
      radius: '6px 6px 26px 26px',
      bg: '#FF4A17',
      fg: '#0C0B0A',
      numberSize: 'text-[44px]',
    },
    {
      kind: 'question',
      label: 'Preguntas',
      value: counts.question,
      span: '',
      radius: '26px 6px 6px 26px',
      bg: '#FFC400',
      fg: '#0C0B0A',
      numberSize: 'text-[38px]',
    },
  ]

  return (
    <section className="px-5">
      <div className="flex items-baseline justify-between font-caption text-[10px] uppercase" style={{ color: '#6E675C' }}>
        <span>El universo · toca una pieza</span>
        <span>
          {recentCount} / {totalRecent} recientes
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2" style={{ gridAutoRows: 'minmax(64px, auto)' }}>
        {tiles.map((tile) => {
          const isActive = activeFilter === tile.kind
          return (
            <button
              key={tile.kind}
              type="button"
              onClick={() => onSelect(tile.kind)}
              className={`relative flex flex-col justify-between p-3 text-left transition-opacity ${tile.span}`}
              style={{
                backgroundColor: tile.bg,
                color: tile.fg,
                borderRadius: tile.radius,
                minHeight: 96,
                outline: isActive ? `2px solid ${tile.fg}` : 'none',
                outlineOffset: isActive ? '-2px' : undefined,
              }}
            >
              <span
                className="font-caption text-[9px] uppercase tracking-[.11em]"
                style={{ color: tile.labelAccent ?? tile.fg }}
              >
                {tile.label}
              </span>
              <span className={`self-end font-ui font-semibold leading-[.8] tracking-[-.05em] ${tile.numberSize}`}>
                {tile.value}
              </span>
              {tile.detail && (
                <span className="text-[11px] opacity-85">{tile.detail}</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-2 w-full py-[9px] font-caption text-[10px] uppercase"
        style={{
          border: '1px dashed #A79F91',
          color: '#6E675C',
          borderRadius: 16,
          background: 'transparent',
        }}
      >
        Ver el universo completo
      </button>
    </section>
  )
}
