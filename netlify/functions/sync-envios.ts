// Tarea programada (corre sola, sin que nadie entre al panel) que
// revisa el estado real de los envíos en Chilexpress y actualiza el
// estado del pedido en consecuencia:
//   - si Chilexpress ya recepcionó el paquete -> "despachado"
//   - si Chilexpress ya lo entregó -> "entregado"
//
// No importa "@/lib/chilexpress" ni "@/lib/supabaseAdmin" a propósito:
// esos archivos tienen `import "server-only"`, que revienta apenas se
// carga fuera del bundler de Next.js (como acá, que Netlify lo arma
// con su propio bundler). Por eso esta función habla con Supabase con
// su propio cliente, y consulta el tracking llamando a nuestra propia
// ruta /api/chilexpress/tracking en vez de usar la librería directo.
//
// Ojo: qué frase exacta usa Chilexpress para cada evento
// (RECEPCIONADO, ENTREGADO, etc.) solo lo vimos en el ejemplo fijo de
// su documentación -- si en producción usan otra redacción, hay que
// ajustar las palabras clave de abajo.
//
// Requiere en las variables de entorno de Netlify (Site settings >
// Environment variables, no alcanza con .env.local): NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. El resto (la clave de Chilexpress) ya la
// usa la propia ruta /api/chilexpress/tracking del sitio.
import { createClient } from "@supabase/supabase-js";

type PedidoCandidato = {
  id: string;
  estado: string;
};

type EventoSeguimiento = { descripcion: string };
type EstadoEnvio = { eventos: EventoSeguimiento[] };

const handler = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = process.env.URL;

  if (!supabaseUrl || !serviceRoleKey || !baseUrl) {
    console.error("sync-envios: faltan variables de entorno.");
    return new Response("faltan variables de entorno", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("id, estado")
    .not("numero_seguimiento", "is", null)
    .in("estado", ["pagado", "preparando", "despachado"]);

  if (error) {
    console.error("sync-envios: no se pudieron leer los pedidos:", error.message);
    return new Response("error leyendo pedidos", { status: 500 });
  }

  let actualizados = 0;

  for (const pedido of (pedidos ?? []) as PedidoCandidato[]) {
    try {
      const res = await fetch(`${baseUrl}/api/chilexpress/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: pedido.id }),
      });

      // OT todavía no disponible en Chilexpress, u otro error puntual --
      // no es grave, se vuelve a intentar en el próximo ciclo.
      if (!res.ok) continue;

      const estadoEnvio = (await res.json()) as EstadoEnvio;
      const descripciones = estadoEnvio.eventos.map((e) => e.descripcion.toUpperCase());

      const entregado = descripciones.some((d) => d.includes("ENTREGAD"));
      const recepcionado = descripciones.some(
        (d) => d.includes("RECEPCION") || d.includes("RUTA") || d.includes("TRANSITO")
      );

      let nuevoEstado: string | null = null;
      if (entregado && pedido.estado !== "entregado") {
        nuevoEstado = "entregado";
      } else if (recepcionado && (pedido.estado === "pagado" || pedido.estado === "preparando")) {
        nuevoEstado = "despachado";
      }

      if (nuevoEstado) {
        const { error: errorUpdate } = await supabase
          .from("pedidos")
          .update({ estado: nuevoEstado })
          .eq("id", pedido.id);

        if (errorUpdate) {
          console.error(`sync-envios: no se pudo actualizar ${pedido.id}:`, errorUpdate.message);
        } else {
          actualizados++;
        }
      }
    } catch (err) {
      console.error(`sync-envios: error consultando el pedido ${pedido.id}:`, err);
    }
  }

  console.log(`sync-envios: revisados ${pedidos?.length ?? 0}, actualizados ${actualizados}.`);
  return new Response("ok");
};

export default handler;

// Cada 30 minutos. Sintaxis cron estándar: minuto hora día mes día-semana.
export const config = {
  schedule: "*/30 * * * *",
};
