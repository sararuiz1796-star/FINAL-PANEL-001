import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Sprint 1: no hay proyecto Supabase conectado todavía (ver docs/HANDOFF_PRODUCT_UX.md).
  // Falla rápido y explícito en vez de dejar que cada query falle con un error confuso.
  console.warn(
    'Supabase no está configurado — completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en app/.env.local',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
