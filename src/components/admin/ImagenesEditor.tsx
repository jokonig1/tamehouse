"use client";

import { useEffect, useState } from "react";
import { etiquetaClase } from "@/components/admin/ProductoForm";
import type { ProductoImagen } from "@/lib/types";

interface ImagenesEditorProps {
  imagenesExistentes: ProductoImagen[];
  archivosNuevos: File[];
  onAgregarArchivos: (archivos: File[]) => void;
  onEliminarExistente: (id: string) => void;
  onQuitarNuevo: (index: number) => void;
}

export default function ImagenesEditor({
  imagenesExistentes,
  archivosNuevos,
  onAgregarArchivos,
  onEliminarExistente,
  onQuitarNuevo,
}: ImagenesEditorProps) {
  return (
    <div>
      <label className={etiquetaClase}>Imágenes</label>
      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">
        Usa fotos verticales de 900 × 1200 px (proporción 3:4). En la tienda se
        recortan para llenar el recuadro, así que evita fotos muy cuadradas o
        muy apaisadas para que no se vean cortadas ni estiradas.
      </p>

      <div className="flex flex-wrap gap-3">
        {imagenesExistentes.map((img) => (
          <div
            key={img.id}
            className="relative aspect-[3/4] w-20 overflow-hidden border border-zinc-300 dark:border-zinc-700"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL dinámica de Supabase Storage, solo vista previa en el panel */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onEliminarExistente(img.id)}
              aria-label="Quitar imagen"
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ))}

        {archivosNuevos.map((archivo, index) => (
          <VistaPreviaArchivo
            key={`${archivo.name}-${index}`}
            archivo={archivo}
            onQuitar={() => onQuitarNuevo(index)}
          />
        ))}

        <label className="flex aspect-[3/4] w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-zinc-400 text-zinc-500 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white">
          <span className="text-lg leading-none">+</span>
          <span className="text-center text-[10px] uppercase tracking-widest">Agregar</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) onAgregarArchivos(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function VistaPreviaArchivo({ archivo, onQuitar }: { archivo: File; onQuitar: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(archivo);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- genera la vista previa del archivo recien seleccionado
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [archivo]);

  return (
    <div className="relative aspect-[3/4] w-20 overflow-hidden border border-zinc-300 dark:border-zinc-700">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:), next/image no soporta este tipo de URL
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onQuitar}
        aria-label="Quitar imagen"
        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-black/70 text-xs text-white hover:bg-red-600"
      >
        ×
      </button>
    </div>
  );
}
