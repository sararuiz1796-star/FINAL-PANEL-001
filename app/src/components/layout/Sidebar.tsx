import { NavLink } from 'react-router-dom'
import { workspaceNavItems } from '../../lib/navigation'

/**
 * Sidebar del Research Workspace. Recorre lib/navigation.ts — no hardcodea
 * el orden ni los labels acá (ver docs/ARCHITECTURE.md §6).
 */
export function Sidebar() {
  return (
    <nav className="flex h-full w-56 flex-shrink-0 flex-col gap-1 bg-bg-dark p-4 text-text-on-dark">
      {workspaceNavItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === ''}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-sm px-2 py-1 text-body ${
                isActive ? 'bg-text-on-dark/10' : ''
              }`
            }
          >
            <Icon size={20} strokeWidth={2.5} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
