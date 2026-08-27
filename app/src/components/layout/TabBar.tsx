import { NavLink } from 'react-router-dom'
import { pieceColor, universeColor } from '../../lib/universeTokens'

/**
 * Tab bar del Universo del proyecto (handoff § 1.6). Reemplaza el Sidebar
 * anterior (docs/DESIGN_SYSTEM.md) para esta pantalla: cinco slots fijos,
 * FAB circular central para crear pieza.
 */
export function TabBar() {
  const inactiveStyle = { color: universeColor.textInactive }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] items-center justify-between px-6 pb-2"
      style={{ height: 74, backgroundColor: universeColor.black }}
    >
      <NavLink
        to=""
        end
        className="font-caption text-[9px] uppercase tracking-[.1em]"
        style={({ isActive }) => ({ color: isActive ? pieceColor.note : universeColor.textInactive })}
      >
        Universo
      </NavLink>
      <NavLink to="mapa" className="font-caption text-[9px] uppercase tracking-[.1em]" style={inactiveStyle}>
        Mapa
      </NavLink>
      <button
        type="button"
        title="Próximamente"
        className="mb-1.5 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full text-[22px]"
        style={{ backgroundColor: '#E8318E', color: universeColor.black }}
      >
        +
      </button>
      <NavLink to="buscar" className="font-caption text-[9px] uppercase tracking-[.1em]" style={inactiveStyle}>
        Buscar
      </NavLink>
      <NavLink to="yo" className="font-caption text-[9px] uppercase tracking-[.1em]" style={inactiveStyle}>
        Yo
      </NavLink>
    </nav>
  )
}
