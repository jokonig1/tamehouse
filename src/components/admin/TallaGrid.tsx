"use client";

import { useState } from "react";
import type { FilaTalla, MedidaItem } from "@/lib/types";

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
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());

  function alternarExpandida(index: number) {
    setExpandidas((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(index)) siguiente.delete(index);
      else siguiente.add(index);
      return siguiente;
    });
  }

  function actualizarMedida(index: number, medidaIndex: number, cambios: Partial<MedidaItem>) {
    const medidas = filas[index].medidas.map((m, i) => (i === medidaIndex ? { ...m, ...cambios } : m));
    onActualizarFila(index, { medidas });
  }

  function agregarMedida(index: number) {
    onActualizarFila(index, {
      medidas: [...filas[index].medidas, { etiqueta: "", valor: "" }],
    });
    setExpandidas((prev) => new Set(prev).add(index));
  }

  function eliminarMedida(index: number, medidaIndex: number) {
    onActualizarFila(index, {
      medidas: filas[index].medidas.filter((_, i) => i !== medidaIndex),
    });
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        Stock por talla
      </h3>

      <div className="flex flex-wrap items-start gap-3">
        {filas.map((fila, index) => (
          <div
            key={fila.id ?? `nueva-${index}`}
            className="flex flex-col gap-1 border border-zinc-200 p-2 dark:border-zinc-800"
          >
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

            <button
              type="button"
              onClick={() => alternarExpandida(index)}
              className="mt-1 text-[10px] font-medium uppercase tracking-widest text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Medidas{fila.medidas.length > 0 && ` (${fila.medidas.length})`}
            </button>

            {expandidas.has(index) && (
              <div className="mt-1 flex flex-col gap-1">
                {fila.medidas.map((medida, medidaIndex) => (
                  <div key={medidaIndex} className="flex items-center gap-1">
                    <input
                      value={medida.etiqueta}
                      onChange={(e) => actualizarMedida(index, medidaIndex, { etiqueta: e.target.value })}
                      placeholder="Ancho"
                      className="w-16 border border-zinc-300 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
                    />
                    <input
                      value={medida.valor}
                      onChange={(e) => actualizarMedida(index, medidaIndex, { valor: e.target.value })}
                      placeholder="50 cm"
                      className="w-16 border border-zinc-300 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarMedida(index, medidaIndex)}
                      aria-label="Eliminar medida"
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => agregarMedida(index)}
                  className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  + agregar medida
                </button>
              </div>
            )}
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
