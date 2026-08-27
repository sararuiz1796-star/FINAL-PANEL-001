/**
 * Espejo en TypeScript de los tokens de docs/DESIGN_SYSTEM.md, para lógica en
 * JS que necesite el valor crudo (ej. elegir color de entidad dinámicamente).
 * La fuente de verdad sigue siendo docs/DESIGN_SYSTEM.md + src/index.css
 * (@theme) — si cambian los tokens ahí, actualizar acá también.
 */

export const colorTokens = {
  bgDark: '#0A0A0A',
  bgLight: '#F5F2ED',
  textOnDark: '#FFFFFF',
  textOnLight: '#0A0A0A',
  orange: '#E8542E',
  pink: '#F2568C',
  purple: '#7B5FE0',
  lime: '#C4F042',
  sky: '#6FC5E8',
  stateError: '#E8542E',
  stateSuccess: '#C4F042',
  // stateWarning / stateNeutral: pendientes — ver docs/DESIGN_SYSTEM.md §9
} as const

export type EntityKind = 'source' | 'document' | 'note' | 'claim' | 'event'

/** Asignación fija de color por entidad — no cambia nunca (DESIGN_SYSTEM.md §2). */
export const entityColor: Record<EntityKind, string> = {
  source: colorTokens.purple,
  document: colorTokens.orange,
  note: colorTokens.lime,
  claim: colorTokens.sky,
  event: colorTokens.pink, // reservado para Phase 2 (Event) — no se usa en Sprint 1-8
}

/**
 * Color de texto de alto contraste sobre un fondo dado — blanco o negro
 * según el color base (DESIGN_SYSTEM.md §5, regla de badges, reutilizada
 * ahora también para superficies grandes de color sólido).
 */
export function contrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? colorTokens.textOnLight : colorTokens.textOnDark
}
