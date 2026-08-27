import { createBrowserRouter } from 'react-router-dom'
import { ScaffoldCheck } from '../features/projects/ScaffoldCheck'

/**
 * Shell de rutas mínimo para Sprint 1 — prueba que el scaffold (Tailwind,
 * routing, providers, navigation config) funciona de punta a punta.
 * Home / Create Project / Research Workspace reales se construyen en el
 * siguiente paso, una vez aprobada y aplicada la migración inicial.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ScaffoldCheck />,
  },
])
