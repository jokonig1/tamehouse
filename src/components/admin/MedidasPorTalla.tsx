"use client";

import type { FilaTalla, MedidaItem } from "@/lib/types";

interface MedidasPorTallaProps {
  filas: FilaTalla[];
  onActualizarFila: (index: number, cambios: Partial<FilaTalla>) => void;
}

export default function MedidasPorTalla({ filas, onActualizarFila }: MedidasPorTallaProps) {
  const hayTallas = filas.some((f) => f.talla.trim() !== "");

  function actualizarMedida(index: number, medidaIndex: number, cambios: Partial<MedidaItem>) {
    const medidas = filas[index].medidas.map((m, i) => (i === medidaIndex ? { ...m, ...cambios } : m));
    onActualizarFila(index, { medidas });
  }

  function agregarMedida(index: number) {
    onActualizarFila(index, {
      medidas: [...filas[index].medidas, { etiqueta: "", valor: "" }],
    });
  }

  function eliminarMedida(index: number, medidaIndex: number) {
    onActualizarFila(index, {
      medidas: filas[index].medidas.filter((_, i) => i !== medidaIndex),
    });
  }

  if (!hayTallas) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Agrega al menos una talla arriba para poder cargarle medidas.
      </p>
    );
  }

  return (
    <div>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        Medidas por talla (opcional)
      </h3>
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        Ej: Ancho / 50 cm, Largo / 70 cm. Se usan para armar la guía de tallas en la tienda.
      </p>

      <div className="flex flex-wrap gap-4">
        {filas.map((fila, index) => {
          if (!fila.talla.trim()) return null;
          return (
            <div
              key={fila.id ?? `nueva-${index}`}
              className="w-56 border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                {fila.talla}
              </p>

              <div className="flex flex-col gap-1.5">
                {fila.medidas.map((medida, medidaIndex) => (
                  <div key={medidaIndex} className="flex items-center gap-1.5">
                    <input
                      value={medida.etiqueta}
                      onChange={(e) => actualizarMedida(index, medidaIndex, { etiqueta: e.target.value })}
                      placeholder="Ancho"
                      className="w-20 border border-zinc-300 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
                    />
                    <input
                      value={medida.valor}
                      onChange={(e) => actualizarMedida(index, medidaIndex, { valor: e.target.value })}
                      placeholder="50 cm"
                      className="w-20 border border-zinc-300 bg-transparent px-1.5 py-1 text-xs outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
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
                  className="mt-1 text-left text-[10px] font-medium uppercase tracking-widest text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  + agregar medida
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
