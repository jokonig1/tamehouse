"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Variante } from "@/lib/types";

interface FilaVariante {
  id: string | null;
  talla: string;
  color: string;
  stock: string;
}

function aFila(v: Variante): FilaVariante {
  return { id: v.id, talla: v.talla ?? "", color: v.color ?? "", stock: String(v.stock) };
}

interface VariantesEditorProps {
  productoId: string;
}

export default function VariantesEditor({ productoId }: VariantesEditorProps) {
  const [filas, setFilas] = useState<FilaVariante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVariantes = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("variantes")
      .select("id, producto_id, talla, color, stock, created_at")
      .eq("producto_id", productoId)
      .order("talla", { ascending: true });

    if (error) setError(error.message);
    else setFilas((data ?? []).map(aFila));
    setCargando(false);
  }, [productoId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarVariantes();
  }, [cargarVariantes]);

  function actualizarFila(index: number, cambios: Partial<FilaVariante>) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  }

  function agregarFila() {
    setFilas((prev) => [...prev, { id: null, talla: "", color: "", stock: "0" }]);
  }

  async function eliminarFila(index: number) {
    const fila = filas[index];
    if (fila.id) {
      if (!confirm("¿Eliminar esta talla?")) return;
      const { error } = await supabase.from("variantes").delete().eq("id", fila.id);
      if (error) {
        alert(`No se pudo eliminar: ${error.message}`);
        return;
      }
    }
    setFilas((prev) => prev.filter((_, i) => i !== index));
  }

  async function guardarCambios() {
    setError(null);

    for (const fila of filas) {
      const stockNumero = Number(fila.stock);
      if (!fila.talla.trim() || Number.isNaN(stockNumero) || stockNumero < 0) {
        setError("Cada talla necesita un nombre y un stock válido (0 o más).");
        return;
      }
    }

    setGuardando(true);

    const nuevas = filas.filter((f) => f.id === null);
    const existentes = filas.filter((f) => f.id !== null);

    if (nuevas.length) {
      const { error: errorInsert } = await supabase.from("variantes").insert(
        nuevas.map((f) => ({
          producto_id: productoId,
          talla: f.talla.trim(),
          color: f.color.trim() || null,
          stock: Number(f.stock),
        }))
      );
      if (errorInsert) {
        setError(errorInsert.message);
        setGuardando(false);
        return;
      }
    }

    for (const f of existentes) {
      const { error: errorUpdate } = await supabase
        .from("variantes")
        .update({ talla: f.talla.trim(), color: f.color.trim() || null, stock: Number(f.stock) })
        .eq("id", f.id as string);

      if (errorUpdate) {
        setError(errorUpdate.message);
        setGuardando(false);
        return;
      }
    }

    await cargarVariantes();
    setGuardando(false);
  }

  if (cargando) return <p className="text-sm text-neutral-500">Cargando variantes...</p>;

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">Stock por talla</h3>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="mb-3 flex flex-wrap items-start gap-3">
        {filas.map((fila, index) => (
          <div key={fila.id ?? `nueva-${index}`} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <input
                value={fila.talla}
                onChange={(e) => actualizarFila(index, { talla: e.target.value })}
                placeholder="Talla"
                className="w-16 rounded border border-neutral-300 px-2 py-1 text-center text-sm uppercase"
              />
              <button
                onClick={() => eliminarFila(index)}
                aria-label="Eliminar talla"
                className="text-neutral-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
            <input
              value={fila.color}
              onChange={(e) => actualizarFila(index, { color: e.target.value })}
              placeholder="Color"
              className="w-16 rounded border border-neutral-300 px-2 py-1 text-center text-xs"
            />
            <input
              type="number"
              min={0}
              value={fila.stock}
              onChange={(e) => actualizarFila(index, { stock: e.target.value })}
              className="w-16 rounded border border-neutral-300 px-2 py-1 text-center text-sm"
            />
          </div>
        ))}

        <button
          onClick={agregarFila}
          aria-label="Agregar talla"
          className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-neutral-400 text-lg leading-none text-neutral-500 hover:border-neutral-600 hover:text-neutral-700"
        >
          +
        </button>
      </div>

      <button
        onClick={guardarCambios}
        disabled={guardando}
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
