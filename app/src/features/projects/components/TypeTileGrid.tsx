import type { ProjectType } from '../../../types/database'
import { contrastTextColor } from '../../../lib/design-tokens'
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
 * Reemplaza el `<select>` administrativo — elegir el tipo se siente como
 * elegir un material, no marcar un checkbox. Tiles de la misma familia se
 * tocan entre sí (borde compartido, sin gap). El elegido pasa a color
 * sólido de su familia + crece levemente + un bloque sólido desplazado
 * detrás (Layer/offset, nunca blur); el resto de los tiles de TODAS las
 * familias baja de opacidad — un "esto es lo que estoy construyendo"
 * inequívoco.
 */
export function TypeTileGrid({ value, onChange }: TypeTileGridProps) {
  return (
    <div className="flex flex-col gap-8">
      {PROJECT_TYPE_GROUPS_ORDERED.map((group) => {
        const meta = PROJECT_TYPE_GROUP_META[group]
        const types = typesInGroup(group)
        return (
          <div key={group}>
            <p className="text-caption font-semibold uppercase tracking-wide text-text-on-light">{meta.label}</p>
            <div className="mt-2 flex flex-wrap border border-bg-dark/15">
              {types.map((type, i) => {
                const selected = value === type
                const dimmed = value !== '' && !selected
                return (
                  <div key={type} className={`relative ${selected ? 'z-10' : ''}`}>
                    {selected && (
                      <div className="absolute inset-0 translate-x-2 translate-y-2" style={{ backgroundColor: meta.color }} />
                    )}
                    <button
                      type="button"
                      onClick={() => onChange(type)}
                      className={`relative px-5 py-4 text-body font-medium transition-all duration-150 ${
                        i > 0 ? 'border-l border-bg-dark/15' : ''
                      } ${selected ? 'scale-105 font-bold' : dimmed ? 'opacity-30' : 'hover:bg-bg-dark/5'}`}
                      style={{
                        backgroundColor: selected ? meta.color : 'transparent',
                        color: selected ? contrastTextColor(meta.color) : undefined,
                      }}
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
