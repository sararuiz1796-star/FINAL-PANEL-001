import { pieceColor, universeColor } from '../../../../lib/universeTokens'

interface ProjectHeaderProps {
  typeLabel: string
  statusLabel: string
  statusColor: string
  titleLine1: string
  titleLine2: string
  verticalLabel: string
  bajada: string
  collaborators: number
  lastMovement: string
  tensions: number
}

/**
 * Cabecera del proyecto (handoff § 1.1). El div crema absoluto abajo con
 * `border-radius: 26px 0 0 0` es el recorte de esquina invertida — gesto
 * central del sistema visual, no decorativo: hace que el negro "muerda" el
 * crema del cuerpo debajo.
 */
export function ProjectHeader({
  typeLabel,
  statusLabel,
  statusColor,
  titleLine1,
  titleLine2,
  verticalLabel,
  bajada,
  collaborators,
  lastMovement,
  tensions,
}: ProjectHeaderProps) {
  return (
    <header className="relative pt-[18px] px-5 pb-[34px]" style={{ backgroundColor: universeColor.black }}>
      <div className="flex items-baseline justify-between font-caption text-[10px] uppercase tracking-[.14em]">
        <span style={{ color: universeColor.textMutedOnBlack }}>{typeLabel}</span>
        <span style={{ color: statusColor }}>{statusLabel}</span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <h1
          className="font-display text-[56px] leading-[.88] tracking-[-.02em]"
          style={{ color: universeColor.cream }}
        >
          {titleLine1}
          <br />
          <em className="italic" style={{ color: pieceColor.note }}>
            {titleLine2}
          </em>
        </h1>
        <span
          className="mb-1 shrink-0 font-caption text-[9px] uppercase"
          style={{
            color: universeColor.textMutedOnBlack,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
          }}
        >
          {verticalLabel}
        </span>
      </div>

      <p className="mt-3 max-w-[270px] text-[13px] leading-[1.45]" style={{ color: universeColor.textSoftOnBlack }}>
        {bajada}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5 font-caption text-[10px]">
        <span
          className="px-3 py-1"
          style={{ backgroundColor: universeColor.cream, color: universeColor.black, borderRadius: '20px 20px 20px 4px' }}
        >
          {collaborators} {collaborators === 1 ? 'persona' : 'personas'}
        </span>
        <span
          className="px-3 py-1"
          style={{
            border: `1px solid ${universeColor.lineOnBlack}`,
            color: universeColor.textSoftOnBlack,
            borderRadius: '4px 20px 20px 20px',
          }}
        >
          últ. mov. {lastMovement}
        </span>
        <span
          className="px-3 py-1"
          style={{ backgroundColor: pieceColor.idea, color: universeColor.black, borderRadius: '20px' }}
        >
          {tensions} {tensions === 1 ? 'tensión' : 'tensiones'}
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[26px] w-full"
        style={{ backgroundColor: universeColor.cream, borderRadius: '26px 0 0 0' }}
      />
    </header>
  )
}
