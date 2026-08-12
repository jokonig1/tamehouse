"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductoRow from "@/components/admin/ProductoRow";
import { campoClase, etiquetaClase } from "@/components/admin/ProductoForm";
import type { ProductoListado } from "@/lib/types";

type FiltroActivo = "todos" | "activos" | "inactivos";

interface VarianteStock {
  stock: number;
}

interface ProductoConVariantes {
  id: string;
  nombre: string;
  precio: number;
  categoria: string | null;
  activo: boolean;
  variantes: VarianteStock[];
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>("todos");

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, categoria, activo, variantes(stock)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const productosConStock = (data ?? []) as unknown as ProductoConVariantes[];
    setProductos(
      productosConStock.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        categoria: p.categoria,
        activo: p.activo,
        stockTotal: p.variantes.reduce((acc, v) => acc + v.stock, 0),
      }))
    );
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarProductos();
  }, [cargarProductos]);

  async function eliminarProducto(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  const categoriasDisponibles = useMemo(
    () =>
      Array.from(new Set(productos.map((p) => p.categoria).filter((c): c is string => Boolean(c)))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [productos]
  );

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) => {
        if (filtroCategoria && p.categoria !== filtroCategoria) return false;
        if (filtroActivo === "activos" && !p.activo) return false;
        if (filtroActivo === "inactivos" && p.activo) return false;
        return true;
      }),
    [productos, filtroCategoria, filtroActivo]
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Productos</h1>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-48">
            <label className={etiquetaClase}>Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`${campoClase} text-zinc-900 dark:text-zinc-100`}
            >
              <option value="">Todas las categorías</option>
              {categoriasDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className={etiquetaClase}>Estado</label>
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value as FiltroActivo)}
              className={`${campoClase} text-zinc-900 dark:text-zinc-100`}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 dark:bg-white dark:text-black"
        >
          Nuevo producto
        </Link>
      </div>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="border border-black/8 dark:border-white/[.145]">
          <div className="grid grid-cols-[1.5rem_2fr_1fr_1fr_1fr_7rem_10rem] gap-2 bg-zinc-50 p-2 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span></span>
            <span>Producto</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Stock</span>
            <span>Activo</span>
            <span></span>
          </div>

          {productos.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              No hay productos todavía.
            </p>
          )}

          {productos.length > 0 && productosFiltrados.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              Ningún producto coincide con los filtros.
            </p>
          )}

          {productosFiltrados.map((p) => (
            <ProductoRow key={p.id} producto={p} onEliminar={eliminarProducto} />
          ))}
        </div>
      )}
    </div>
  );
}
