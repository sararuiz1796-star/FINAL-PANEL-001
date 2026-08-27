import { NavLink } from 'react-router-dom'
import { workspaceNavItems, type NavEntityType } from '../../lib/navigation'
import { entityColor } from '../../lib/design-tokens'

/**
 * Sidebar del Research Workspace. Recorre lib/navigation.ts — no hardcodea
 * el orden ni los labels acá (ver docs/ARCHITECTURE.md §6).
 *
 * El estado activo se tiñe con el color de la entidad correspondiente — el
 * sidebar se convierte en el mapa de colores del propio sistema, no en un
 * tinte genérico. "Overview" y "Connections" no tienen color de entidad
 * (Connections es una capacidad transversal, no una entidad más — ver
 * docs/ARCHITECTURE.md §7) y usan un tinte neutro en su lugar.
 *
 * Responsive: rail vertical en desktop, barra inferior de solo íconos en
 * mobile (patrón de pulgar).
 */
const ACTIVE_COLOR: Partial<Record<NavEntityType, string>> = {
  source: entityColor.source,
  document: entityColor.document,
  note: entityColor.note,
  claim: entityColor.claim,
}

export function Sidebar() {
  return (
    <nav
      className="flex flex-shrink-0 flex-row justify-around gap-1 bg-bg-dark p-2 text-text-on-dark
                 fixed bottom-0 left-0 right-0 z-20
                 md:static md:h-full md:w-56 md:flex-col md:justify-start md:p-4"
    >
      {workspaceNavItems.map((item) => {
        const Icon = item.icon
        const tint = ACTIVE_COLOR[item.key]
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === ''}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-sm px-2 py-1 text-caption
               md:flex-row md:gap-2 md:px-2 md:py-1 md:text-body ${isActive ? '' : ''}`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? `${tint ?? '#FFFFFF'}${tint ? '26' : '1A'}` : 'transparent',
            })}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span className="hidden md:inline">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
