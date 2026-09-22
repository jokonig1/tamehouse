"use client";

import Image from "next/image";
import { useState } from "react";
import type { BiografiaFoto } from "@/lib/biografia";

const POR_PAGINA = 4;

function Flecha({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-5 w-5"
    >
      {direccion === "izquierda" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

export default function GaleriaBiografia({ fotos }: { fotos: BiografiaFoto[] }) {
  const [pagina, setPagina] = useState(0);
  const [fotoAmpliada, setFotoAmpliada] = useState<BiografiaFoto | null>(null);

  const totalPaginas = Math.ceil(fotos.length / POR_PAGINA);
  const visibles = fotos.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPagina((p) => Math.max(0, p - 1))}
          disabled={pagina === 0}
          aria-label="Fotos anteriores"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <Flecha direccion="izquierda" />
        </button>

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {visibles.map((foto) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setFotoAmpliada(foto)}
              aria-label="Ver foto completa"
              className="group relative aspect-square overflow-hidden rounded-sm bg-stone-200"
            >
              <Image
                src={foto.url}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
          disabled={pagina >= totalPaginas - 1}
          aria-label="Más fotos"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 disabled:pointer-events-none disabled:opacity-30"
        >
          <Flecha direccion="derecha" />
        </button>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPagina(i)}
              aria-label={`Ir a la página ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === pagina ? "w-6 bg-stone-900" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}

      {fotoAmpliada && (
        <div
          role="dialog"
          aria-modal
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
        >
          <button
            type="button"
            onClick={() => setFotoAmpliada(null)}
            aria-label="Cerrar"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="relative h-full max-h-[85vh] w-full max-w-4xl">
            <Image
              src={fotoAmpliada.url}
              alt=""
              fill
              sizes="90vw"
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
