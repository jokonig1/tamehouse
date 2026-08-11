import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Usa cookies (no localStorage) para guardar la sesion, para que el
// middleware pueda leerla en el servidor y proteger rutas como /admin.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)