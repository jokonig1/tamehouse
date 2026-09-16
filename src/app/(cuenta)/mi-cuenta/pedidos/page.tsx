"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

function imagenDe(item: ItemPedido) {
  const imagenes = item.variantes?.productos?.producto_imagenes ?? [];
  return [...imagenes].sort((a, b) => a.orden - b.orden)[0]?.url ?? null;
}

function formatoFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
}

const ESTADOS: Record<string, { label: string; pill: string }> = {
  pagado: { label: "Pagado", pill: "bg-emerald-100 text-emerald-700" },
  preparando: { label: "Preparando", pill: "bg-purple-100 text-purple-700" },
  despachado: { label: "Despachado", pill: "bg-blue-100 text-blue-700" },
  entregado: { label: "Entregado", pill: "bg-green-100 text-green-700" },
};

type ItemPedido = {
  id: string;
  cantidad: number;
  precio_unitario: number;
  variantes: {
    talla: string | null;
    productos: {
      nombre: string;
      producto_imagenes: { url: string; orden: number }[];
    } | null;
  } | null;
};

type Pedido = {
  id: string;
  estado: string;
  total: number;
  created_at: string;
  numero_seguimiento: string | null;
  pedido_items: ItemPedido[];
};

export default function Page() {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const { data: usuario } = await supabase.auth.getUser();
      if (!usuario.user) {
        setPedidos([]);
        return;
      }

      const { data, error: errorConsulta } = await supabase
        .from("pedidos")
        .select(
          "id, estado, total, created_at, numero_seguimiento, pedido_items(id, cantidad, precio_unitario, variantes(talla, productos(nombre, producto_imagenes(url, orden))))"
        )
        .eq("cliente_id", usuario.user.id)
        .order("created_at", { ascending: false });

      if (errorConsulta) {
        setError("No pudimos cargar tus pedidos.");
        return;
      }

      setPedidos((data as unknown as Pedido[] | null) ?? []);
    }

    cargar();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Mis pedidos</h1>

      {error && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!error && pedidos === null && (
        <p className="mt-8 text-sm text-zinc-500">Cargando...</p>
      )}

      {!error && pedidos !== null && pedidos.length === 0 && (
        <div className="mt-8 rounded-lg border border-black/10 p-6">
          <p className="text-sm text-zinc-500">Todavía no tienes pedidos.</p>
          <Link href="/" className="mt-2 inline-block text-sm font-medium underline hover:opacity-70">
            Ir a la tienda
          </Link>
        </div>
      )}

      {!error && pedidos !== null && pedidos.length > 0 && (
        <div className="mt-8 flex flex-col gap-4">
          {pedidos.map((pedido) => {
            const estado = ESTADOS[pedido.estado] ?? { label: pedido.estado, pill: "bg-zinc-100 text-zinc-700" };
            return (
              <div key={pedido.id} className="rounded-lg border border-black/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-zinc-500">{formatoFecha(pedido.created_at)}</p>
                    <p className="text-xs text-zinc-400">Pedido #{pedido.id.slice(0, 8)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${estado.pill}`}>
                    {estado.label}
                  </span>
                </div>

                <ul className="mt-4 flex flex-col gap-4 border-t border-black/10 pt-4">
                  {pedido.pedido_items.map((item) => {
                    const imagenUrl = imagenDe(item);
                    return (
                      <li key={item.id} className="flex items-center gap-4">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-black/5">
                          {imagenUrl && (
                            <Image
                              src={imagenUrl}
                              alt={item.variantes?.productos?.nombre ?? "Producto"}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="flex-1 text-sm">
                          {item.variantes?.productos?.nombre ?? "Producto"}
                          {item.variantes?.talla ? ` · Talla ${item.variantes.talla}` : ""}
                          {` × ${item.cantidad}`}
                        </span>
                        <span className="text-sm text-zinc-600">
                          {formatoPrecio.format(item.precio_unitario * item.cantidad)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {pedido.numero_seguimiento && (
                  <p className="mt-3 text-xs text-zinc-500">
                    N.º de seguimiento: {pedido.numero_seguimiento}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 font-semibold">
                  <span>Total</span>
                  <span>{formatoPrecio.format(pedido.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
