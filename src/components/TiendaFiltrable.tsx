"use client";

import { useMemo, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { PRODUCTOS_BOCETO, type Producto } from "@/lib/productos";

function pillClass(activo: boolean) {
  return activo
    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
    : "border-black/10 bg-white text-black hover:bg-black/5 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10";
}

export default function TiendaFiltrable({ productos }: { productos: Producto[] }) {
  const lista = productos.length > 0 ? productos : PRODUCTOS_BOCETO;

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(lista.map((p) => p.categoria).filter((c): c is string => !!c))
      ).sort(),
    [lista]
  );

  const [categoria, setCategoria] = useState<string | null>(null);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = lista.filter((p) => {
    const coincideCategoria = !categoria || p.categoria === categoria;
    const coincideBusqueda =
      !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div>
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setCategoria(null)}
          className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-5 text-sm font-medium transition-colors ${pillClass(categoria === null)}`}
        >
          Ver todo
          <span className="text-xs opacity-60">{lista.length}</span>
        </button>

        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            className={`h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors ${pillClass(categoria === c)}`}
          >
            {c}
          </button>
        ))}

        <div className="flex shrink-0 items-center gap-2">
          {busquedaAbierta && (
            <input
              autoFocus
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-40 rounded-full border border-black/10 px-4 text-sm outline-none dark:border-white/20 dark:bg-transparent sm:w-56"
            />
          )}
          <button
            type="button"
            onClick={() => {
              if (busquedaAbierta) setBusqueda("");
              setBusquedaAbierta((v) => !v);
            }}
            aria-label="Buscar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <ProductGrid
          productos={filtrados}
          mensajeVacio="No encontramos productos con ese filtro."
        />
      </div>
    </div>
  );
}
