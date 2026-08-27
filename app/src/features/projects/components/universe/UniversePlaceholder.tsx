import { universeColor } from '../../../../lib/universeTokens'

/**
 * Placeholder honesto para los slots de la tab bar que el handoff no
 * especifica todavía (Mapa de conexiones a pantalla completa, Buscar, Yo —
 * ver README § Fidelity / § Assets, "falta por diseñar").
 */
export function UniversePlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-start justify-center gap-2 px-5 pb-24"
      style={{ backgroundColor: universeColor.cream }}
    >
      <span className="font-caption text-[10px] uppercase" style={{ color: universeColor.textMutedOnCream }}>
        {label}
      </span>
      <h1 className="font-display text-[32px] italic" style={{ color: universeColor.black }}>
        Todavía no está diseñado.
      </h1>
    </div>
  )
}
