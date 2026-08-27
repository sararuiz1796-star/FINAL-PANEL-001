import type { ProjectType } from '../../../types/database'
import {
  PROJECT_TYPE_GROUPS_ORDERED,
  PROJECT_TYPE_GROUP_META,
  PROJECT_TYPE_META,
  typesInGroup,
} from '../../../lib/projectTypeGroups'

interface TypeTileGridProps {
  value: ProjectType | ''
  onChange: (value: ProjectType) => void
}

/**
 * Reemplaza el `<select>` administrativo — "¿qué estás construyendo?" se
 * responde tocando un tile, no llenando un campo. Profundidad por Layer/
 * offset (un bloque sólido detrás, sin blur) marca la selección en vez de
 * un simple cambio de borde.
 */
export function TypeTileGrid({ value, onChange }: TypeTileGridProps) {
  return (
    <div className="flex flex-col gap-6">
      {PROJECT_TYPE_GROUPS_ORDERED.map((group) => {
        const meta = PROJECT_TYPE_GROUP_META[group]
        return (
          <div key={group}>
            <p className="text-caption font-medium uppercase tracking-wide text-text-on-light">{meta.label}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {typesInGroup(group).map((type) => {
                const selected = value === type
                return (
                  <div key={type} className="relative">
                    {selected && (
                      <div
                        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-sm"
                        style={{ backgroundColor: meta.color }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => onChange(type)}
                      className={`relative rounded-sm border px-4 py-2 text-body transition-transform ${
                        selected ? 'border-bg-dark bg-bg-light font-semibold' : 'border-bg-dark/15 bg-bg-light'
                      }`}
                    >
                      {PROJECT_TYPE_META[type].label}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
