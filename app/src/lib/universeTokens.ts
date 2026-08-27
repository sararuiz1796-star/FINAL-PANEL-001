/**
 * Tokens de color de la pantalla "El universo" (handoff hifi "Retratos del
 * Valle"). Paleta propia, deliberadamente distinta de lib/design-tokens.ts
 * (que sigue vigente para Home/ComingSoon/Connections) — ver comentario en
 * src/index.css. Espejo en TS de los mismos hex de las variables
 * `--color-universe-*` para lógica JS (elegir color de pieza dinámicamente).
 */

export const universeColor = {
  black: '#0C0B0A',
  desk: '#100F0D',
  cream: '#F2E9DA',
  creamElevated: '#FFFDF7',
  creamSunken: '#E9DFCB',
  lineOnCream: '#DED5C4',
  lineOnCream2: '#C9C0AE',
  lineOnCreamDashed: '#A79F91',
  lineOnBlack: '#3A3630',
  textMutedOnCream: '#6E675C',
  textMutedOnBlack: '#8A857A',
  textSoftOnBlack: '#CFC7B8',
  textInactive: '#7A756B',
  bodyOnCream: '#3A3630',
} as const

/**
 * Un "tipo de pieza" en la UI de Universo. Fuente e Idea/Pregunta no son
 * tablas separadas en el esquema: Fuente = `sources`, Idea/Pregunta/Nota =
 * `notes` distinguidas por `note_type` ('idea' | 'question' | resto),
 * Afirmación = `claims`, Documento = `documents`. Ver
 * supabase/migrations/0001_init.sql — notes.note_type ya incluye 'idea' y
 * 'question', no hace falta ninguna migración nueva.
 */
export type PieceKind = 'source' | 'note' | 'idea' | 'claim' | 'question' | 'document'

export const pieceColor: Record<PieceKind, string> = {
  source: '#1B3CFF',
  note: '#C6F24E',
  idea: '#E8318E',
  claim: '#FF4A17',
  question: '#FFC400',
  document: '#0C0B0A',
}

export const pieceLabel: Record<PieceKind, string> = {
  source: 'Fuente',
  note: 'Nota',
  idea: 'Idea',
  claim: 'Afirmación',
  question: 'Pregunta',
  document: 'Documento',
}

export const pieceCodePrefix: Record<PieceKind, string> = {
  source: 'F',
  note: 'N',
  idea: 'I',
  claim: 'A',
  question: 'P',
  document: 'D',
}

/** Blanco crema o negro casi puro según el color de fondo — regla del handoff (§ Colores — entidades). */
export function universeContrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? universeColor.black : universeColor.cream
}

/** `note_type` -> tipo de pieza visual ('idea'/'question' se separan, el resto queda como 'note'). */
export function pieceKindFromNoteType(noteType: string | null): PieceKind {
  if (noteType === 'idea') return 'idea'
  if (noteType === 'question') return 'question'
  return 'note'
}
