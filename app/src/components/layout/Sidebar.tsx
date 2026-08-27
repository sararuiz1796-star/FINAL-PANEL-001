import { workspaceNavItems } from '../../lib/navigation'

/**
 * Sidebar del Research Workspace. Recorre lib/navigation.ts — no hardcodea
 * el orden ni los labels acá (ver docs/ARCHITECTURE.md §6).
 */
export function Sidebar() {
  return (
    <nav className="flex h-full w-56 flex-col gap-1 bg-bg-dark p-md text-text-on-dark">
      {workspaceNavItems.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.key} className="flex items-center gap-sm rounded-sm px-sm py-xs text-body">
            <Icon size={20} strokeWidth={2.5} />
            <span>{item.label}</span>
          </div>
        )
      })}
    </nav>
  )
}
