import { Outlet, useParams } from 'react-router-dom'
import { TabBar } from '../../../components/layout/TabBar'

/**
 * Shell del Research Workspace para la pantalla "El universo" (handoff
 * hifi): cada ruta hija dibuja su propia cabecera (la pantalla de Universo
 * ya trae la suya, § 1.1) — este shell solo aporta la tab bar fija y el
 * Outlet.
 */
export function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="min-h-screen">
      <Outlet context={{ projectId }} />
      <TabBar />
    </div>
  )
}
