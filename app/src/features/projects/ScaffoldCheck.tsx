import { Sidebar } from '../../components/layout/Sidebar'
import { entityColor } from '../../lib/design-tokens'

/**
 * Pantalla temporal de verificación del scaffold — NO es Home ni Research
 * Workspace real. Se reemplaza en el próximo paso (features reales de
 * Sprint 1: Auth, Home, Create Project, Workspace) una vez que la migración
 * 0001_init.sql esté aprobada y aplicada en el proyecto Supabase real.
 */
export function ScaffoldCheck() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-lg">
        <h1 className="text-h1 font-bold">PARNASO — scaffold Sprint 1</h1>
        <p className="mt-sm text-body">
          Tailwind + tokens, routing, TanStack Query y la config de navegación están andando. Sin conexión a
          Supabase todavía (ver <code>app/.env.example</code>).
        </p>
        <div className="mt-lg flex gap-sm">
          {(Object.keys(entityColor) as Array<keyof typeof entityColor>).map((key) => (
            <div
              key={key}
              className="rounded-md px-md py-sm text-caption font-medium text-text-on-light"
              style={{ backgroundColor: entityColor[key] }}
            >
              {key}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
