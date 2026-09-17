"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductoRow from "@/components/admin/ProductoRow";
import { campoClase, etiquetaClase } from "@/components/admin/ProductoForm";
import type { ProductoListado } from "@/lib/types";

type FiltroActivo = "todos" | "activos" | "inactivos";
type CampoOrden = "nombre" | "categoria" | "precio" | "stock" | "activo";

const PESTANAS_ACTIVO: { valor: FiltroActivo; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "activos", label: "Activos" },
  { valor: "inactivos", label: "Inactivos" },
];

const POR_PAGINA = 10;

interface VarianteStock {
  stock: number;
}

interface ImagenOrden {
  url: string;
  orden: number;
}

interface ProductoConVariantes {
  id: string;
  nombre: string;
  precio: number;
  categoria: string | null;
  activo: boolean;
  variantes: VarianteStock[];
  producto_imagenes: ImagenOrden[];
}

function IconoOrden({ activo, ascendente }: { activo: boolean; ascendente: boolean }) {
  return (
    <span className="ml-1 inline-flex flex-col justify-center">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`h-2 w-2.5 ${activo && ascendente ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
      >
        <path d="M12 6l6 8H6l6-8Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`-mt-0.5 h-2 w-2.5 ${activo && !ascendente ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"}`}
      >
        <path d="M12 18l-6-8h12l-6 8Z" />
      </svg>
    </span>
  );
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<FiltroActivo>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [pagina, setPagina] = useState(1);
  const [ordenCampo, setOrdenCampo] = useState<CampoOrden | null>(null);
  const [ordenAsc, setOrdenAsc] = useState(true);

  function alternarOrden(campo: CampoOrden) {
    if (ordenCampo === campo) {
      setOrdenAsc((asc) => !asc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(true);
    }
  }

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, categoria, activo, variantes(stock), producto_imagenes(url, orden)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const productosConDatos = (data ?? []) as unknown as ProductoConVariantes[];
    setProductos(
      productosConDatos.map((p) => {
        const imagenes = [...p.producto_imagenes].sort((a, b) => a.orden - b.orden);
        return {
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          categoria: p.categoria,
          activo: p.activo,
          stockTotal: p.variantes.reduce((acc, v) => acc + v.stock, 0),
          tieneTallaSinStock: p.variantes.some((v) => v.stock === 0),
          imagenUrl: imagenes[0]?.url ?? null,
        };
      })
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
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      siguiente.delete(id);
      return siguiente;
    });
  }

  async function eliminarSeleccionados() {
    if (seleccionados.size === 0) return;
    if (!confirm(`¿Eliminar ${seleccionados.size} producto(s)? Esta acción no se puede deshacer.`))
      return;

    const ids = Array.from(seleccionados);
    const { error } = await supabase.from("productos").delete().in("id", ids);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    setProductos((prev) => prev.filter((p) => !seleccionados.has(p.id)));
    setSeleccionados(new Set());
  }

  async function ocultarSeleccionados() {
    if (seleccionados.size === 0) return;

    const ids = Array.from(seleccionados);
    const { error } = await supabase.from("productos").update({ activo: false }).in("id", ids);
    if (error) {
      alert(`No se pudo actualizar: ${error.message}`);
      return;
    }
    setSeleccionados(new Set());
    await cargarProductos();
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
        if (busqueda.trim() && !p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
          return false;
        return true;
      }),
    [productos, filtroCategoria, filtroActivo, busqueda]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- vuelve a la pagina 1 cuando cambian los filtros
    setPagina(1);
  }, [filtroCategoria, filtroActivo, busqueda]);

  const productosOrdenados = useMemo(() => {
    if (!ordenCampo) return productosFiltrados;

    const copia = [...productosFiltrados];
    copia.sort((a, b) => {
      let resultado = 0;
      switch (ordenCampo) {
        case "nombre":
          resultado = a.nombre.localeCompare(b.nombre);
          break;
        case "categoria":
          resultado = (a.categoria ?? "").localeCompare(b.categoria ?? "");
          break;
        case "precio":
          resultado = a.precio - b.precio;
          break;
        case "stock":
          resultado = a.stockTotal - b.stockTotal;
          break;
        case "activo":
          resultado = Number(a.activo) - Number(b.activo);
          break;
      }
      return ordenAsc ? resultado : -resultado;
    });
    return copia;
  }, [productosFiltrados, ordenCampo, ordenAsc]);

  const totalPaginas = Math.max(1, Math.ceil(productosOrdenados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const productosPagina = productosOrdenados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  const todosEnPaginaSeleccionados =
    productosPagina.length > 0 && productosPagina.every((p) => seleccionados.has(p.id));

  function alternarSeleccionTodos() {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      if (todosEnPaginaSeleccionados) {
        productosPagina.forEach((p) => siguiente.delete(p.id));
      } else {
        productosPagina.forEach((p) => siguiente.add(p.id));
      }
      return siguiente;
    });
  }

  function alternarSeleccion(id: string) {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Productos</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Productos</h1>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <label className={etiquetaClase}>Categoría</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className={`${campoClase} rounded-full text-zinc-900 dark:text-zinc-100`}
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
              className={`${campoClase} rounded-full text-zinc-900 dark:text-zinc-100`}
            >
              {PESTANAS_ACTIVO.map((pestana) => (
                <option key={pestana.valor} value={pestana.valor}>
                  {pestana.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-64">
            <label className={etiquetaClase}>Buscar</label>
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
                placeholder="Buscar producto..."
                className="w-full rounded-full border border-zinc-300 bg-transparent py-2 pr-3 pl-9 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:text-zinc-100 dark:focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80"
          >
            Nuevo producto
            <span aria-hidden="true" className="text-sm leading-none">
              +
            </span>
          </Link>
        </div>
      </div>

      {seleccionados.size > 0 && (
        <div className="mb-4 flex items-center justify-between border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm dark:border-blue-400 dark:bg-blue-900/20">
          <span>{seleccionados.size} producto(s) seleccionado(s)</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={ocultarSeleccionados}
              className="text-xs font-semibold uppercase tracking-widest hover:opacity-70"
            >
              Ocultar de la tienda
            </button>
            <button
              type="button"
              onClick={eliminarSeleccionados}
              className="text-xs font-semibold uppercase tracking-widest text-red-600 hover:opacity-70 dark:text-red-400"
            >
              Eliminar seleccionados
            </button>
          </div>
        </div>
      )}

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          <div className="grid grid-cols-[1.5rem_1.5rem_2fr_1fr_1fr_1fr_7rem_6rem] items-center gap-6 bg-zinc-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={todosEnPaginaSeleccionados}
              onChange={alternarSeleccionTodos}
              className="accent-blue-600"
              aria-label="Seleccionar todos"
            />
            <span></span>
            <button
              type="button"
              onClick={() => alternarOrden("nombre")}
              className="flex items-center hover:text-black dark:hover:text-white"
            >
              Producto
              <IconoOrden activo={ordenCampo === "nombre"} ascendente={ordenAsc} />
            </button>
            <button
              type="button"
              onClick={() => alternarOrden("categoria")}
              className="flex items-center hover:text-black dark:hover:text-white"
            >
              Categoría
              <IconoOrden activo={ordenCampo === "categoria"} ascendente={ordenAsc} />
            </button>
            <button
              type="button"
              onClick={() => alternarOrden("precio")}
              className="flex items-center hover:text-black dark:hover:text-white"
            >
              Precio
              <IconoOrden activo={ordenCampo === "precio"} ascendente={ordenAsc} />
            </button>
            <button
              type="button"
              onClick={() => alternarOrden("stock")}
              className="flex items-center hover:text-black dark:hover:text-white"
            >
              Stock
              <IconoOrden activo={ordenCampo === "stock"} ascendente={ordenAsc} />
            </button>
            <button
              type="button"
              onClick={() => alternarOrden("activo")}
              className="flex items-center hover:text-black dark:hover:text-white"
            >
              Activo
              <IconoOrden activo={ordenCampo === "activo"} ascendente={ordenAsc} />
            </button>
            <span>Acción</span>
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

          {productosPagina.map((p) => (
            <ProductoRow
              key={`${p.id}-${p.activo}`}
              producto={p}
              onEliminar={eliminarProducto}
              seleccionado={seleccionados.has(p.id)}
              onSeleccionar={() => alternarSeleccion(p.id)}
            />
          ))}

          {productosFiltrados.length > 0 && (
            <div className="flex items-center justify-between border-t border-black/8 px-4 py-3 text-xs text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              <span>
                {(paginaSegura - 1) * POR_PAGINA + 1}-
                {Math.min(paginaSegura * POR_PAGINA, productosFiltrados.length)} de{" "}
                {productosFiltrados.length}
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
