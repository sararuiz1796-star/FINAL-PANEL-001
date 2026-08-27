import { contrastTextColor } from '../../../lib/design-tokens'

export type PieceVariant = 'block' | 'tab' | 'flag' | 'frame'

interface ProjectPieceProps {
  title: string
  familyLabel: string
  color: string
  variant: PieceVariant
  className?: string
}

/**
 * Vocabulario de piezas para Home — 4 siluetas distintas, no una card
 * repetida con un acento de color. Nada de cortes diagonales (recurso que
 * se había vuelto repetitivo en la versión anterior): acá el color toma
 * forma de bloque sólido, cápsula que sangra fuera del borde, esquina en
 * cuarto de círculo, o marco sin relleno — cuatro siluetas reales.
 */
export function ProjectPiece({ title, familyLabel, color, variant, className = '' }: ProjectPieceProps) {
  const onColor = contrastTextColor(color)

  if (variant === 'block') {
    return (
      <div className={`flex min-h-48 flex-col justify-between p-6 ${className}`} style={{ backgroundColor: color }}>
        <span className="text-caption font-semibold uppercase tracking-wide" style={{ color: onColor }}>
          {familyLabel}
        </span>
        <h2 className="text-h2 font-bold leading-tight" style={{ color: onColor }}>
          {title}
        </h2>
      </div>
    )
  }

  if (variant === 'tab') {
    return (
      <div className={`relative min-h-48 bg-bg-light p-6 pt-10 ${className}`}>
        <span
          className="absolute -top-3 left-6 rounded-full px-4 py-1 text-caption font-semibold uppercase tracking-wide"
          style={{ backgroundColor: color, color: onColor }}
        >
          {familyLabel}
        </span>
        <h2 className="mt-6 text-h2 font-bold leading-tight text-text-on-light">{title}</h2>
      </div>
    )
  }

  if (variant === 'flag') {
    return (
      <div className={`relative min-h-48 overflow-hidden bg-bg-light p-6 ${className}`}>
        <div className="absolute -left-6 -top-6 h-24 w-24 rounded-br-full" style={{ backgroundColor: color }} />
        <span className="relative text-caption font-semibold uppercase tracking-wide text-text-on-light">{familyLabel}</span>
        <h2 className="relative mt-16 text-h2 font-bold leading-tight text-text-on-light">{title}</h2>
      </div>
    )
  }

  // frame
  return (
    <div className={`flex min-h-48 flex-col justify-between border-4 bg-bg-light p-6 ${className}`} style={{ borderColor: color }}>
      <span className="text-caption font-semibold uppercase tracking-wide" style={{ color }}>
        {familyLabel}
      </span>
      <h2 className="text-h2 font-bold leading-tight text-text-on-light">{title}</h2>
    </div>
  )
}
