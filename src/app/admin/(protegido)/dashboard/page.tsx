"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatTile from "@/components/admin/StatTile";
import BarraRanking from "@/components/admin/BarraRanking";
import GraficoIngresosMensuales from "@/components/admin/GraficoIngresosMensuales";
import BarraApilada from "@/components/admin/BarraApilada";

const formatoPrecio = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
const formatoCompacto = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  notation: "compact",
});

// Debajo de esto se considera "stock bajo" y se avisa en el dashboard.
const UMBRAL_STOCK_BAJO = 3;
const MESES_HISTORIAL = 6;

interface PedidoConsulta {
  id: string;
  total: number;
  comuna: string | null;
  retiro_oficina_code: number | null;
  created_at: string;
}

interface VarianteEmbebida {
  talla: string | null;
  producto_id: string;
  productos: { nombre: string } | null;
}

interface PedidoItemConsulta {
  cantidad: number;
  variantes: VarianteEmbebida | null;
}

interface VarianteStockBajo {
  id: string;
  talla: string | null;
  stock: number;
  productos: { nombre: string } | null;
}

function claveMes(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

function etiquetaMes(fecha: Date) {
  return fecha.toLocaleDateString("es-CL", { month: "short" }).replace(".", "");
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<PedidoConsulta[]>([]);
  const [items, setItems] = useState<PedidoItemConsulta[]>([]);
  const [stockBajo, setStockBajo] = useState<VarianteStockBajo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    const [respPedidos, respItems, respStock] = await Promise.all([
      supabase
        .from("pedidos")
        .select("id, total, comuna, retiro_oficina_code, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("pedido_items")
        .select("cantidad, variantes(talla, producto_id, productos(nombre))"),
      supabase
        .from("variantes")
        .select("id, talla, stock, productos(nombre)")
        .lte("stock", UMBRAL_STOCK_BAJO)
        .order("stock", { ascending: true }),
    ]);

    if (respPedidos.error || respItems.error || respStock.error) {
      setError(
        respPedidos.error?.message ??
          respItems.error?.message ??
          respStock.error?.message ??
          "No se pudieron cargar las métricas."
      );
      setCargando(false);
      return;
    }

    setPedidos((respPedidos.data ?? []) as unknown as PedidoConsulta[]);
    setItems((respItems.data ?? []) as unknown as PedidoItemConsulta[]);
    setStockBajo((respStock.data ?? []) as unknown as VarianteStockBajo[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  const ingresosPorMes = useMemo(() => {
    const ahora = new Date();
    const buckets: { clave: string; mes: string; ingresos: number }[] = [];
    for (let i = MESES_HISTORIAL - 1; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      buckets.push({ clave: claveMes(fecha), mes: etiquetaMes(fecha), ingresos: 0 });
    }

    const porClave = new Map(buckets.map((b) => [b.clave, b]));
    for (const p of pedidos) {
      const bucket = porClave.get(claveMes(new Date(p.created_at)));
      if (bucket) bucket.ingresos += p.total;
    }

    return buckets;
  }, [pedidos]);

  const kpis = useMemo(() => {
    const ahora = new Date();
    const claveEsteMes = claveMes(ahora);
    const claveMesAnterior = claveMes(new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1));

    const pedidosEsteMes = pedidos.filter((p) => claveMes(new Date(p.created_at)) === claveEsteMes);
    const pedidosMesAnterior = pedidos.filter(
      (p) => claveMes(new Date(p.created_at)) === claveMesAnterior
    );

    const ingresosEsteMes = pedidosEsteMes.reduce((suma, p) => suma + p.total, 0);
    const ingresosMesAnterior = pedidosMesAnterior.reduce((suma, p) => suma + p.total, 0);

    const deltaIngresos =
      ingresosMesAnterior > 0
        ? Math.round(((ingresosEsteMes - ingresosMesAnterior) / ingresosMesAnterior) * 100)
        : null;

    const ticketPromedio = pedidos.length > 0
      ? pedidos.reduce((suma, p) => suma + p.total, 0) / pedidos.length
      : 0;

    return {
      ingresosEsteMes,
      pedidosEsteMes: pedidosEsteMes.length,
      deltaIngresos,
      ticketPromedio,
    };
  }, [pedidos]);

  const productosMasVendidos = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const item of items) {
      const nombre = item.variantes?.productos?.nombre;
      if (!nombre) continue;
      conteo.set(nombre, (conteo.get(nombre) ?? 0) + item.cantidad);
    }
    return Array.from(conteo.entries())
      .map(([label, valor]) => ({ id: label, label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [items]);

  const tallasMasVendidas = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const item of items) {
      const talla = item.variantes?.talla;
      if (!talla) continue;
      conteo.set(talla, (conteo.get(talla) ?? 0) + item.cantidad);
    }
    return Array.from(conteo.entries())
      .map(([label, valor]) => ({ id: label, label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [items]);

  const comunasFrecuentes = useMemo(() => {
    const conteo = new Map<string, number>();
    for (const p of pedidos) {
      if (!p.comuna) continue;
      conteo.set(p.comuna, (conteo.get(p.comuna) ?? 0) + 1);
    }
    return Array.from(conteo.entries())
      .map(([label, valor]) => ({ id: label, label, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [pedidos]);

  const entrega = useMemo(() => {
    const retiro = pedidos.filter((p) => p.retiro_oficina_code !== null).length;
    const envio = pedidos.length - retiro;
    return [
      { id: "envio", label: "Envío a domicilio", valor: envio, color: "bg-[#2a78d6] dark:bg-[#3987e5]" },
      { id: "retiro", label: "Retiro en sucursal", valor: retiro, color: "bg-[#eb6834] dark:bg-[#d95926]" },
    ];
  }, [pedidos]);

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/pedidos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Dashboard</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Dashboard</h1>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              label="Ingresos este mes"
              value={formatoPrecio.format(kpis.ingresosEsteMes)}
              delta={
                kpis.deltaIngresos === null
                  ? null
                  : {
                      texto: `${kpis.deltaIngresos >= 0 ? "+" : ""}${kpis.deltaIngresos}% vs mes anterior`,
                      esBueno: kpis.deltaIngresos >= 0,
                    }
              }
            />
            <StatTile label="Pedidos este mes" value={kpis.pedidosEsteMes.toString()} />
            <StatTile label="Ticket promedio" value={formatoPrecio.format(kpis.ticketPromedio)} />
            <StatTile
              label="Variantes con stock bajo"
              value={stockBajo.length.toString()}
              alerta={stockBajo.length > 0}
            />
          </div>

          <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Ingresos por mes
            </h2>
            <GraficoIngresosMensuales
              datos={ingresosPorMes.map((b) => ({ mes: b.mes, ingresos: b.ingresos }))}
              formatoValor={(n) => formatoCompacto.format(n)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Productos más vendidos
              </h2>
              <BarraRanking items={productosMasVendidos} vacio="Todavía no hay ventas." />
            </div>

            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Tallas más vendidas
              </h2>
              <BarraRanking items={tallasMasVendidas} vacio="Todavía no hay ventas." />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Comunas más frecuentes
              </h2>
              <BarraRanking items={comunasFrecuentes} vacio="Todavía no hay pedidos." />
            </div>

            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Envío vs. retiro
              </h2>
              <BarraApilada segmentos={entrega} />
            </div>
          </div>

          <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Variantes con stock bajo (≤ {UMBRAL_STOCK_BAJO})
            </h2>

            {stockBajo.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ningún producto está por agotarse.
              </p>
            )}

            {stockBajo.length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {stockBajo.map((v) => (
                    <tr key={v.id} className="border-t border-black/8 dark:border-white/[.145]">
                      <td className="py-2 pr-2">{v.productos?.nombre ?? "Producto eliminado"}</td>
                      <td className="py-2 pr-2 text-zinc-600 dark:text-zinc-400">
                        Talla {v.talla ?? "-"}
                      </td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          v.stock === 0
                            ? "text-[#d03b3b] dark:text-[#e66767]"
                            : "text-[#fab219] dark:text-[#fab219]"
                        }`}
                      >
                        {v.stock === 0 ? "Agotado" : `${v.stock} unidades`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
