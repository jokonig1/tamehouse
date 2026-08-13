"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductoImagen } from "@/lib/types";

export default function ProductoGaleria({
  imagenes,
  nombre,
}: {
  imagenes: ProductoImagen[];
  nombre: string;
}) {
  const [seleccionada, setSeleccionada] = useState(0);
  const [ampliada, setAmpliada] = useState(false);

  if (imagenes.length === 0) {
    return (
      <div className="flex items-center justify-center p-16">
        <p className="text-sm text-zinc-400">Imagen próximamente</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 p-6 sm:p-10">
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        aria-label="Ver imagen en grande"
        className="w-full max-w-md cursor-zoom-in overflow-hidden rounded-lg bg-zinc-100"
      >
        <Image
          src={imagenes[seleccionada].url}
          alt={nombre}
          width={900}
          height={1200}
          sizes="(min-width: 1024px) 448px, 80vw"
          className="aspect-auto h-auto max-h-[600px] w-full object-contain"
          priority
        />
      </button>

      {imagenes.length > 1 && (
        <div className="flex gap-3">
          {imagenes.map((imagen, i) => (
            <button
              key={imagen.id}
              type="button"
              onClick={() => setSeleccionada(i)}
              className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-md border transition-colors ${
                i === seleccionada ? "border-black" : "border-black/10 hover:border-black/30"
              }`}
            >
              <Image src={imagen.url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {ampliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setAmpliada(false)}
        >
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            aria-label="Cerrar"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
          >
            ✕
          </button>
          <div className="relative h-full max-h-[85vh] w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imagenes[seleccionada].url}
              alt={nombre}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
