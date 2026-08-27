import { supabase } from '../../lib/supabase/client'

/**
 * Capa de Auth aislada — hoy implementa email+password. Agregar OAuth o
 * magic link más adelante significa sumar funciones acá y en AuthPage.tsx,
 * sin tocar Home/Create Project/Workspace: todos ellos solo conocen
 * `useSession()` (lib/supabase/session.ts), nunca el método usado para
 * llegar a esa sesión.
 */

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
