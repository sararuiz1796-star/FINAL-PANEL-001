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
