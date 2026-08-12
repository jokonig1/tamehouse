"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import VariantesEditor from "@/components/admin/VariantesEditor";
import type { ProductoListado } from "@/lib/types";

interface ProductoRowProps {
  producto: ProductoListado;
  onEliminar: (id: string) => void;
}

export default function ProductoRow({ producto, onEliminar }: ProductoRowProps) {
  const [expandido, setExpandido] = useState(false);
  const [activo, setActivo] = useState(producto.activo);
  const [guardandoActivo, setGuardandoActivo] = useState(false);
  const [precio, setPrecio] = useState(producto.precio);

  async function alternarActivo() {
    const nuevoValor = !activo;
    setActivo(nuevoValor);
    setGuardandoActivo(true);

    const { error } = await supabase
      .from("productos")
      .update({ activo: nuevoValor })
      .eq("id", producto.id);

    setGuardandoActivo(false);
    if (error) {
      setActivo(!nuevoValor);
      alert(`No se pudo actualizar: ${error.message}`);
    }
  }

  return (
    <div className="border-t border-black/8 dark:border-white/[.145]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpandido((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandido((v) => !v);
          }
        }}
        className="grid cursor-pointer grid-cols-[1.5rem_2fr_1fr_1fr_1fr_7rem_10rem] items-center gap-2 p-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <span aria-hidden="true" className="w-6 text-zinc-500">
          {expandido ? "▾" : "▸"}
        </span>

        <p className="font-medium">{producto.nombre}</p>

        <span className="text-zinc-600 dark:text-zinc-400">{producto.categoria ?? "-"}</span>
        <span>${precio.toLocaleString("es-CL")}</span>

        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              producto.stockTotal > 0 ? "bg-green-600" : "bg-zinc-400"
            }`}
          />
          {producto.stockTotal} unidades
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${activo ? "bg-green-600" : "bg-zinc-400"}`}
          />
          {activo ? "Sí" : "No"}
        </span>

        <div
          className="flex items-center justify-end gap-4 text-xs font-medium uppercase tracking-widest"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/admin/productos/${producto.id}`} className="hover:opacity-70">
            Editar
          </Link>
          <button
            onClick={() => onEliminar(producto.id)}
            className="text-red-600 hover:opacity-70 dark:text-red-400"
          >
            Eliminar
          </button>
        </div>
      </div>

      {expandido && (
        <div className="space-y-6 border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
            <input
              type="checkbox"
              checked={activo}
              disabled={guardandoActivo}
              onChange={alternarActivo}
            />
            Visible en la tienda
          </label>

          <VariantesEditor
            productoId={producto.id}
            precioInicial={precio}
            onPrecioGuardado={setPrecio}
          />
        </div>
      )}
    </div>
  );
}
