"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PedidoRow from "@/components/admin/PedidoRow";
import type { EstadoPedido, PedidoListado } from "@/lib/types";

type FiltroEstado = "todos" | EstadoPedido;

const formatoPrecio = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const POR_PAGINA = 10;

const PESTANAS: { valor: FiltroEstado; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "pagado", label: "Pagado" },
  { valor: "preparando", label: "Preparando" },
  { valor: "despachado", label: "Despachado" },
  { valor: "entregado", label: "Entregado" },
];

function esEsteMes(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const ahora = new Date();
  return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
}

interface PedidoConsulta {
  id: string;
  cliente_id: string | null;
  estado: EstadoPedido;
  total: number;
  direccion: string | null;
  comuna: string | null;
  numero_seguimiento: string | null;
  created_at: string;
  pedido_items: { count: number }[];
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("pedidos")
      .select(
        "id, cliente_id, estado, total, direccion, comuna, numero_seguimiento, created_at, pedido_items(count)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const filas = (data ?? []) as unknown as PedidoConsulta[];

    const clienteIds = Array.from(
      new Set(filas.map((p) => p.cliente_id).filter((id): id is string => Boolean(id)))
    );

    let nombresPorId: Record<string, string> = {};
    if (clienteIds.length) {
      const { data: perfiles } = await supabase
        .from("perfiles")
        .select("id, nombre")
        .in("id", clienteIds);
      nombresPorId = Object.fromEntries(
        (perfiles ?? []).map((p) => [p.id, p.nombre ?? "Cliente"])
      );
    }

    setPedidos(
      filas.map((p) => ({
        id: p.id,
        cliente_id: p.cliente_id,
        estado: p.estado,
        total: p.total,
        direccion: p.direccion,
        comuna: p.comuna,
        numero_seguimiento: p.numero_seguimiento,
        created_at: p.created_at,
        itemsCount: p.pedido_items?.[0]?.count ?? 0,
        clienteNombre: p.cliente_id ? (nombresPorId[p.cliente_id] ?? null) : null,
      }))
    );
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarPedidos();
  }, [cargarPedidos]);

  const resumen = useMemo(() => {
    const esteMes = pedidos.filter((p) => esEsteMes(p.created_at));
    return {
      totalesEsteMes: esteMes.length,
      nuevos: pedidos.filter((p) => p.estado === "pagado").length,
      empacados: pedidos.filter((p) => p.estado === "preparando").length,
      ingresosEsteMes: esteMes.reduce((suma, p) => suma + p.total, 0),
    };
  }, [pedidos]);

  const conteosPorEstado = useMemo(() => {
    const conteos: Record<FiltroEstado, number> = {
      todos: pedidos.length,
      pagado: 0,
      preparando: 0,
      despachado: 0,
      entregado: 0,
    };
    for (const p of pedidos) conteos[p.estado]++;
    return conteos;
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    const busquedaNormalizada = busqueda.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;
      if (
        busquedaNormalizada &&
        !p.id.toLowerCase().includes(busquedaNormalizada) &&
        !(p.clienteNombre ?? "").toLowerCase().includes(busquedaNormalizada)
      )
        return false;
      return true;
    });
  }, [pedidos, filtroEstado, busqueda]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- vuelve a la pagina 1 cuando cambian los filtros
    setPagina(1);
  }, [filtroEstado, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const pedidosPagina = pedidosFiltrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Pedidos</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Pedidos</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Pedidos este mes",
            valor: resumen.totalesEsteMes.toString(),
            card: "border border-black/8 dark:border-white/[.145]",
            etiqueta: "text-zinc-600 dark:text-zinc-400",
            numero: "",
          },
          {
            label: "Pedidos nuevos",
            valor: resumen.nuevos.toString(),
            card: "border border-black/8 dark:border-white/[.145]",
            etiqueta: "text-zinc-600 dark:text-zinc-400",
            numero: "text-yellow-700 dark:text-yellow-400",
          },
          {
            label: "Pedidos empacados",
            valor: resumen.empacados.toString(),
            card: "border border-black/8 dark:border-white/[.145]",
            etiqueta: "text-zinc-600 dark:text-zinc-400",
            numero: "text-purple-700 dark:text-purple-400",
          },
          {
            label: "Ingresos este mes",
            valor: formatoPrecio.format(resumen.ingresosEsteMes),
            card: "border border-black/8 dark:border-white/[.145]",
            etiqueta: "text-zinc-600 dark:text-zinc-400",
            numero: "text-green-700 dark:text-green-400",
          },
        ].map((tarjeta) => (
          <div key={tarjeta.label} className={`rounded-xl p-4 ${tarjeta.card}`}>
            <p className={`text-xs font-medium uppercase tracking-widest ${tarjeta.etiqueta}`}>
              {tarjeta.label}
            </p>
            <p className={`mt-2 text-center text-3xl font-bold tracking-tight ${tarjeta.numero}`}>
              {tarjeta.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {PESTANAS.map((pestana) => {
            const activa = filtroEstado === pestana.valor;
            return (
              <button
                key={pestana.valor}
                type="button"
                onClick={() => setFiltroEstado(pestana.valor)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-widest ${
                  activa
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-black/8 hover:opacity-70 dark:border-white/[.145]"
                }`}
              >
                {pestana.label} {conteosPorEstado[pestana.valor]}
              </button>
            );
          })}
        </div>

        <div className="w-64">
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o ID de pedido..."
              className="w-full rounded-full border border-zinc-300 bg-transparent py-2 pr-3 pl-9 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_0.7fr_1fr_1fr] gap-6 bg-zinc-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span></span>
            <span>Pedido</span>
            <span>Cliente</span>
            <span>Fecha</span>
            <span>Items</span>
            <span>Total</span>
            <span>Estado</span>
          </div>

          {pedidos.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              No hay pedidos todavía.
            </p>
          )}

          {pedidos.length > 0 && pedidosFiltrados.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              Ningún pedido coincide con el filtro.
            </p>
          )}

          {pedidosPagina.map((p) => (
            <PedidoRow key={p.id} pedido={p} />
          ))}

          {pedidosFiltrados.length > 0 && (
            <div className="flex items-center justify-between border-t border-black/8 px-4 py-3 text-xs text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              <span>
                {(paginaSegura - 1) * POR_PAGINA + 1}-
                {Math.min(paginaSegura * POR_PAGINA, pedidosFiltrados.length)} de{" "}
                {pedidosFiltrados.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaSegura === 1}
                  className="font-semibold uppercase tracking-widest hover:opacity-70 disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <span>
                  Página {paginaSegura} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaSegura === totalPaginas}
                  className="font-semibold uppercase tracking-widest hover:opacity-70 disabled:opacity-30"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
