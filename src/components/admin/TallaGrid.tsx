"use client";

import type { FilaTalla } from "@/lib/types";

interface TallaGridProps {
  filas: FilaTalla[];
  onActualizarFila: (index: number, cambios: Partial<FilaTalla>) => void;
  onAgregarTalla: () => void;
  onEliminarFila: (index: number) => void;
}

export default function TallaGrid({
  filas,
  onActualizarFila,
  onAgregarTalla,
  onEliminarFila,
}: TallaGridProps) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        Stock por talla
      </h3>

      <div className="flex flex-wrap items-start gap-3">
        {filas.map((fila, index) => (
          <div key={fila.id ?? `nueva-${index}`} className="flex flex-col gap-1">
            <div className="relative">
              <input
                value={fila.talla}
                onChange={(e) => onActualizarFila(index, { talla: e.target.value })}
                placeholder="Talla"
                className="w-20 border border-zinc-300 bg-transparent px-2 py-1 pr-6 text-center text-sm uppercase outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
              />
              <button
                type="button"
                onClick={() => onEliminarFila(index)}
                aria-label="Eliminar talla"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
              >
                ×
              </button>
            </div>
            <input
              type="number"
              min={0}
              value={fila.stock}
              onChange={(e) => onActualizarFila(index, { stock: e.target.value })}
              className="w-20 border border-zinc-300 bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={onAgregarTalla}
          aria-label="Agregar talla"
          className="flex h-9 w-9 items-center justify-center self-end border border-dashed border-zinc-400 text-lg leading-none text-zinc-500 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
