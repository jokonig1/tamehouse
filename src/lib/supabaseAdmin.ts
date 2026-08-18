import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con la service role key -- salta RLS por completo. Nunca
// importar este archivo desde un componente "use client": el import
// "server-only" hace fallar el build si eso pasa por error.
//
// Se crea de forma perezosa (recien al primer uso, no al cargar el
// modulo) para que `next build` no reviente si la variable todavia
// no esta seteada -- esta ruta es 100% dinamica de todos modos.
let cliente: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return cliente;
}
