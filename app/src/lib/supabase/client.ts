import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase no está configurado — completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en app/.env.local',
  )
}

/**
 * Sin el genérico `<Database>` en createClient() a propósito: con
 * @supabase/supabase-js 2.112.4 + moduleResolution "bundler" (el que usa
 * este proyecto por Vite/Tailwind v4), el tipado de `.insert()`/`.update()`
 * contra un Database generado a mano se resuelve mal (bug de inferencia de
 * tipos, no del esquema real — reproducido y aislado antes de aplicar este
 * workaround). Cada función en features/.../api.ts sigue tipando a mano su
 * entrada y su retorno (ver src/types/database.ts) — se pierde solo el
 * chequeo automático de la forma exacta del payload de `.insert()` en tiempo
 * de compilación; la validación real de todas formas la hacen los CHECK
 * constraints y el trigger de relationships en la base.
 */
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
