"use client";

import type { FilaTalla } from "@/lib/types";

interface MedidasPorTallaProps {
  filas: FilaTalla[];
  onActualizarFila: (index: number, cambios: Partial<FilaTalla>) => void;
}

export default function MedidasPorTalla({ filas, onActualizarFila }: MedidasPorTallaProps) {
  const columnas = filas
    .map((fila, index) => ({ fila, index }))
    .filter((c) => c.fila.talla.trim() !== "");

  const numFilas = Math.max(0, ...columnas.map((c) => c.fila.medidas.length));
  const etiquetasFila: string[] = [];
  for (let i = 0; i < numFilas; i++) {
    const conEtiqueta = columnas.find((c) => c.fila.medidas[i]?.etiqueta.trim());
    etiquetasFila.push(conEtiqueta?.fila.medidas[i]?.etiqueta ?? "");
  }

  function actualizarCelda(columnaIndex: number, filaIndex: number, valor: string) {
    const medidas = [...filas[columnaIndex].medidas];
    while (medidas.length <= filaIndex) {
      medidas.push({ etiqueta: etiquetasFila[medidas.length] ?? "", valor: "" });
    }
    medidas[filaIndex] = { ...medidas[filaIndex], valor };
    onActualizarFila(columnaIndex, { medidas });
  }

  function renombrarFila(filaIndex: number, etiqueta: string) {
    columnas.forEach(({ fila, index }) => {
      const medidas = [...fila.medidas];
      while (medidas.length <= filaIndex) {
        medidas.push({ etiqueta: "", valor: "" });
      }
      medidas[filaIndex] = { ...medidas[filaIndex], etiqueta };
      onActualizarFila(index, { medidas });
    });
  }

  function agregarFila() {
    columnas.forEach(({ fila, index }) => {
      onActualizarFila(index, { medidas: [...fila.medidas, { etiqueta: "", valor: "" }] });
    });
  }

  function eliminarFila(filaIndex: number) {
    columnas.forEach(({ fila, index }) => {
      onActualizarFila(index, { medidas: fila.medidas.filter((_, i) => i !== filaIndex) });
    });
  }

  if (columnas.length === 0) {
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
        Las columnas son las tallas que ya creaste arriba. Agrega filas para cada medida (Pecho,
        Largo, Manga, etc.) -- se usan para armar la guía de tallas en la tienda.
      </p>

      <div className="overflow-x-auto">
        <table className="border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-28 border border-zinc-200 bg-zinc-50 p-1.5 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                Medida
              </th>
              {columnas.map(({ fila }) => (
                <th
                  key={fila.id ?? fila.talla}
                  className="w-24 border border-zinc-200 bg-zinc-50 p-1.5 text-center text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {fila.talla}
                </th>
              ))}
              <th className="w-8 border border-zinc-200 dark:border-zinc-800" />
            </tr>
          </thead>
          <tbody>
            {etiquetasFila.map((etiqueta, filaIndex) => (
              <tr key={filaIndex}>
                <td className="border border-zinc-200 p-1 dark:border-zinc-800">
                  <input
                    value={etiqueta}
                    onChange={(e) => renombrarFila(filaIndex, e.target.value)}
                    placeholder="Pecho"
                    className="w-full bg-transparent px-1 py-1 text-xs font-medium outline-none"
                  />
                </td>
                {columnas.map(({ fila, index }) => (
                  <td key={fila.id ?? fila.talla} className="border border-zinc-200 p-1 dark:border-zinc-800">
                    <input
                      value={fila.medidas[filaIndex]?.valor ?? ""}
                      onChange={(e) => actualizarCelda(index, filaIndex, e.target.value)}
                      placeholder="50 cm"
                      className="w-full bg-transparent px-1 py-1 text-center text-xs outline-none"
                    />
                  </td>
                ))}
                <td className="border border-zinc-200 p-1 text-center dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => eliminarFila(filaIndex)}
                    aria-label="Eliminar medida"
                    className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={agregarFila}
        className="mt-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
      >
        + agregar medida
      </button>
    </div>
  );
}
