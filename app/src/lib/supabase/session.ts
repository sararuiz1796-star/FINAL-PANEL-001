import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './client'

/**
 * Única fuente de verdad de "quién está logueado" para todo el producto.
 * El resto de PARNASO (Home, Create Project, Workspace) solo conoce esta
 * forma — nunca el método de autenticación usado para llegar a ella. Eso
 * es lo que permite agregar OAuth/magic link después (features/auth) sin
 * tocar ninguna otra parte de la app.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
