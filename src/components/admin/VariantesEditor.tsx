"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PrecioInput from "@/components/admin/PrecioInput";
import TallaGrid from "@/components/admin/TallaGrid";
import type { FilaTalla, Variante } from "@/lib/types";

const FILA_VACIA: FilaTalla = { id: null, talla: "", stock: "0" };

function aFilas(variantes: Variante[]): FilaTalla[] {
  return variantes.map((v) => ({ id: v.id, talla: v.talla ?? "", stock: String(v.stock) }));
}

interface VariantesEditorProps {
  productoId: string;
  precioInicial: number;
  onPrecioGuardado: (nuevoPrecio: number) => void;
}

export default function VariantesEditor({
  productoId,
  precioInicial,
  onPrecioGuardado,
}: VariantesEditorProps) {
  const [filas, setFilas] = useState<FilaTalla[]>([]);
  const [modoAvanzado, setModoAvanzado] = useState(false);
  const [precio, setPrecio] = useState(String(precioInicial));
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

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const filasCargadas = aFilas(data ?? []);
    const yaUsaTalla = filasCargadas.some((f) => f.talla !== "");

    setFilas(filasCargadas.length > 0 ? filasCargadas : [FILA_VACIA]);
    setModoAvanzado(yaUsaTalla);
    setCargando(false);
  }, [productoId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarVariantes();
  }, [cargarVariantes]);

  function actualizarFila(index: number, cambios: Partial<FilaTalla>) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  }

  function agregarTalla() {
    setFilas((prev) => [...prev, { id: null, talla: "", stock: "0" }]);
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
    setFilas((prev) => {
      const restante = prev.filter((_, i) => i !== index);
      return restante.length > 0 ? restante : [FILA_VACIA];
    });
  }

  function cancelar() {
    setError(null);
    setPrecio(String(precioInicial));
    cargarVariantes();
  }

  async function guardarCambios() {
    setError(null);

    const precioNumero = Number(precio);
    if (!precio || Number.isNaN(precioNumero) || precioNumero <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }

    for (const fila of filas) {
      const stockNumero = Number(fila.stock);
      if (fila.stock.trim() === "" || Number.isNaN(stockNumero) || stockNumero < 0) {
        setError("El stock debe ser un número válido (0 o más).");
        return;
      }
    }

    setGuardando(true);

    if (precioNumero !== precioInicial) {
      const { error: errorPrecio } = await supabase
        .from("productos")
        .update({ precio: precioNumero })
        .eq("id", productoId);

      if (errorPrecio) {
        setError(errorPrecio.message);
        setGuardando(false);
        return;
      }
    }

    const nuevas = filas
      .filter((f) => f.id === null)
      .map((f) => ({
        producto_id: productoId,
        talla: f.talla.trim() || null,
        color: null,
        stock: Number(f.stock),
      }));

    if (nuevas.length) {
      const { error: errorInsert } = await supabase.from("variantes").insert(nuevas);
      if (errorInsert) {
        setError(errorInsert.message);
        setGuardando(false);
        return;
      }
    }

    const existentes = filas.filter((f) => f.id !== null);

    for (const f of existentes) {
      const { error: errorUpdate } = await supabase
        .from("variantes")
        .update({ talla: f.talla.trim() || null, stock: Number(f.stock) })
        .eq("id", f.id as string);

      if (errorUpdate) {
        setError(errorUpdate.message);
        setGuardando(false);
        return;
      }
    }

    onPrecioGuardado(precioNumero);
    await cargarVariantes();
    setGuardando(false);
  }

  if (cargando)
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando variantes...</p>;

  const modoSimple = !modoAvanzado && filas.length === 1 && filas[0].talla === "";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        {modoSimple ? (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Stock
            </h3>
            <input
              type="number"
              min={0}
              value={filas[0].stock}
              onChange={(e) => actualizarFila(0, { stock: e.target.value })}
              className="w-24 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
            />
            <button
              type="button"
              onClick={() => setModoAvanzado(true)}
              className="mt-3 block text-xs font-medium uppercase tracking-widest hover:opacity-70"
            >
              + Vender por talla
            </button>
          </div>
        ) : (
          <TallaGrid
            filas={filas}
            onActualizarFila={actualizarFila}
            onAgregarTalla={agregarTalla}
            onEliminarFila={eliminarFila}
          />
        )}

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            Precio
          </h3>
          <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-500">
            Precio (CLP)
          </label>
          <PrecioInput
            value={precio}
            onChange={setPrecio}
            className="w-32 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={guardarCambios}
          disabled={guardando}
          className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          onClick={cancelar}
          disabled={guardando}
          className="border border-black/8 px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:opacity-70 disabled:opacity-50 dark:border-white/[.145]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
