import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/supabase/session'
import { Spinner } from '../components/ui/Spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/** Inverso de RequireAuth — evita mostrar /login a alguien ya logueado. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  return <>{children}</>
}
