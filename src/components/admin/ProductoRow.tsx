"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import VariantesEditor from "@/components/admin/VariantesEditor";
import type { ProductoListado } from "@/lib/types";

interface ProductoRowProps {
  producto: ProductoListado;
  onEliminar: (id: string) => void;
  seleccionado: boolean;
  onSeleccionar: () => void;
}

const iconoClase = "h-4 w-4";

export default function ProductoRow({
  producto,
  onEliminar,
  seleccionado,
  onSeleccionar,
}: ProductoRowProps) {
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
        className="grid cursor-pointer grid-cols-[1.5rem_1.5rem_2fr_1fr_1fr_1fr_7rem_6rem] items-center gap-6 px-4 py-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <input
          type="checkbox"
          checked={seleccionado}
          onClick={(e) => e.stopPropagation()}
          onChange={onSeleccionar}
          className="accent-blue-600"
          aria-label={`Seleccionar ${producto.nombre}`}
        />

        <span aria-hidden="true" className="w-6 text-zinc-500">
          {expandido ? "▾" : "▸"}
        </span>

        <div className="flex items-center gap-3">
          {producto.imagenUrl ? (
            <Image
              src={producto.imagenUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          )}
          <p className="font-medium">{producto.nombre}</p>
        </div>

        <span className="text-zinc-600 dark:text-zinc-400">{producto.categoria ?? "-"}</span>
        <span>${precio.toLocaleString("es-CL")}</span>

        <span className="flex items-center gap-1.5">
          {producto.stockTotal} unidades
          {producto.tieneTallaSinStock && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0"
              aria-label="Hay tallas sin stock"
            >
              <title>Hay tallas sin stock</title>
              <path
                d="M12 3.5 2 20.5h20L12 3.5Z"
                fill="#facc15"
                stroke="black"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <rect x="11.1" y="10" width="1.8" height="5.5" rx="0.9" fill="black" />
              <circle cx="12" cy="17.5" r="1.1" fill="black" />
            </svg>
          )}
        </span>

        <button
          type="button"
          disabled={guardandoActivo}
          onClick={(e) => {
            e.stopPropagation();
            alternarActivo();
          }}
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-widest disabled:cursor-wait ${
            activo
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </button>

        <div
          className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/producto/${producto.id}`}
            target="_blank"
            aria-label="Ver en la tienda"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>

          <Link
            href={`/admin/productos/${producto.id}`}
            aria-label="Editar"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
              />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => onEliminar(producto.id)}
            aria-label="Eliminar"
            className="hover:text-red-600 dark:hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
              />
              <path strokeLinecap="round" d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {expandido && (
        <div className="space-y-6 border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
          <VariantesEditor
            productoId={producto.id}
            precioInicial={precio}
            onPrecioGuardado={setPrecio}
            activo={activo}
            guardandoActivo={guardandoActivo}
            onAlternarActivo={alternarActivo}
          />
        </div>
      )}
    </div>
  );
}
