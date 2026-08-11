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
    <div className="border-t border-neutral-200">
      <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] items-center gap-2 p-2 text-sm">
        <button
          onClick={() => setExpandido((v) => !v)}
          aria-label={expandido ? "Contraer" : "Expandir"}
          className="w-6 text-neutral-500"
        >
          {expandido ? "▾" : "▸"}
        </button>

        <div>
          <p className="font-medium">{producto.nombre}</p>
          {producto.descripcion && (
            <p className="text-xs text-neutral-500">{producto.descripcion}</p>
          )}
        </div>

        <span>{producto.categoria ?? "-"}</span>
        <span>${producto.precio.toLocaleString("es-CL")}</span>

        <span className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              producto.stockTotal > 0 ? "bg-green-600" : "bg-neutral-400"
            }`}
          />
          {producto.stockTotal} unidades
        </span>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/productos/${producto.id}`}
            className="text-neutral-900 hover:underline"
          >
            Editar
          </Link>
          <button
            onClick={() => onEliminar(producto.id)}
            className="text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>

      {expandido && (
        <div className="space-y-4 border-t border-neutral-100 bg-neutral-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={activo}
              disabled={guardandoActivo}
              onChange={alternarActivo}
            />
            Visible en la tienda
          </label>

          <VariantesEditor productoId={producto.id} />
        </div>
      )}
    </div>
  );
}
