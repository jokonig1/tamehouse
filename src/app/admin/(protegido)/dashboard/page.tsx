"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StatTile from "@/components/admin/StatTile";
import BarraRanking from "@/components/admin/BarraRanking";
import TopProductos from "@/components/admin/TopProductos";
import GraficoIngresosMensuales from "@/components/admin/GraficoIngresosMensuales";

// Un color por tarjeta (de la paleta categórica validada) para que el
// dashboard se distinga de un vistazo -- adentro de cada gráfico
// sigue siendo un solo hue, como pide la guía de dataviz.
const COLOR_PRODUCTOS = "bg-[#1baf7a] dark:bg-[#199e70]";
const COLOR_TALLAS = "bg-[#4a3aa7] dark:bg-[#9085e9]";
const COLOR_COMUNAS = "bg-[#eb6834] dark:bg-[#d95926]";
const COLOR_USUARIOS_NUEVOS = "bg-[#eda100] dark:bg-[#c98500]";
const COLOR_ALERTA = "bg-[#d03b3b] dark:bg-[#e66767]";

const BORDE_USUARIOS_TOTAL = "border-t-[#4a3aa7] dark:border-t-[#9085e9]";

function IconoIngresos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IconoPedidos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

function IconoUsuarios() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function IconoAlerta() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

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
  created_at: string;
}

interface PerfilConsulta {
  id: string;
  created_at: string;
}

interface VarianteEmbebida {
  talla: string | null;
  producto_id: string;
  productos: {
    nombre: string;
    producto_imagenes: { url: string; orden: number }[] | null;
  } | null;
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
  const [clientes, setClientes] = useState<PerfilConsulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    const [respPedidos, respItems, respStock, respClientes] = await Promise.all([
      supabase
        .from("pedidos")
        .select("id, total, comuna, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("pedido_items")
        .select(
          "cantidad, variantes(talla, producto_id, productos(nombre, producto_imagenes(url, orden)))"
        ),
      supabase
        .from("variantes")
        .select("id, talla, stock, productos(nombre)")
        .lte("stock", UMBRAL_STOCK_BAJO)
        .order("stock", { ascending: true }),
      supabase.from("perfiles").select("id, created_at").eq("rol", "cliente"),
    ]);

    if (respPedidos.error || respItems.error || respStock.error || respClientes.error) {
      setError(
        respPedidos.error?.message ??
          respItems.error?.message ??
          respStock.error?.message ??
          respClientes.error?.message ??
          "No se pudieron cargar las métricas."
      );
      setCargando(false);
      return;
    }

    setPedidos((respPedidos.data ?? []) as unknown as PedidoConsulta[]);
    setItems((respItems.data ?? []) as unknown as PedidoItemConsulta[]);
    setStockBajo((respStock.data ?? []) as unknown as VarianteStockBajo[]);
    setClientes((respClientes.data ?? []) as unknown as PerfilConsulta[]);
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

    return {
      ingresosEsteMes,
      pedidosEsteMes: pedidosEsteMes.length,
      deltaIngresos,
    };
  }, [pedidos]);

  const usuarios = useMemo(() => {
    const claveEsteMes = claveMes(new Date());
    const nuevosEsteMes = clientes.filter(
      (c) => claveMes(new Date(c.created_at)) === claveEsteMes
    ).length;

    return { nuevosEsteMes, total: clientes.length };
  }, [clientes]);

  const productosMasVendidos = useMemo(() => {
    const conteo = new Map<string, { vendidos: number; imagenUrl: string | null }>();
    for (const item of items) {
      const producto = item.variantes?.productos;
      if (!producto) continue;

      const actual = conteo.get(producto.nombre) ?? { vendidos: 0, imagenUrl: null };
      actual.vendidos += item.cantidad;
      if (!actual.imagenUrl) {
        const imagenes = [...(producto.producto_imagenes ?? [])].sort((a, b) => a.orden - b.orden);
        actual.imagenUrl = imagenes[0]?.url ?? null;
      }
      conteo.set(producto.nombre, actual);
    }
    return Array.from(conteo.entries())
      .map(([nombre, v]) => ({ id: nombre, nombre, ...v }))
      .sort((a, b) => b.vendidos - a.vendidos)
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
              icono={<IconoIngresos />}
              destacado
            />
            <StatTile
              label="Pedidos este mes"
              value={kpis.pedidosEsteMes.toString()}
              icono={<IconoPedidos />}
              color={COLOR_PRODUCTOS}
            />
            <StatTile
              label="Usuarios nuevos este mes"
              value={usuarios.nuevosEsteMes.toString()}
              icono={<IconoUsuarios />}
              color={COLOR_USUARIOS_NUEVOS}
            />
            <StatTile
              label="Variantes con stock bajo"
              value={stockBajo.length.toString()}
              alerta={stockBajo.length > 0}
              icono={<IconoAlerta />}
              color={stockBajo.length > 0 ? COLOR_ALERTA : undefined}
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
              <TopProductos
                items={productosMasVendidos.map((p) => ({
                  id: p.id,
                  nombre: p.nombre,
                  imagenUrl: p.imagenUrl,
                  vendidos: p.vendidos,
                }))}
                vacio="Todavía no hay ventas."
              />
            </div>

            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Tallas más vendidas
              </h2>
              <BarraRanking
                items={tallasMasVendidas}
                vacio="Todavía no hay ventas."
                color={COLOR_TALLAS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-black/8 p-5 dark:border-white/[.145]">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Comunas más frecuentes
              </h2>
              <BarraRanking
                items={comunasFrecuentes}
                vacio="Todavía no hay pedidos."
                color={COLOR_COMUNAS}
              />
            </div>

            <div
              className={`rounded-xl border border-t-4 border-black/8 p-5 dark:border-white/[.145] ${BORDE_USUARIOS_TOTAL}`}
            >
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Usuarios totales registrados
              </h2>
              <p className="mt-3 text-4xl font-semibold text-zinc-900 dark:text-zinc-100">
                {usuarios.total}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Clientes con cuenta creada en la tienda, desde el inicio.
              </p>
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
