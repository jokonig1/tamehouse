"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { campoClaseRedondeado, etiquetaClaseFuerte } from "@/components/admin/ProductoForm";
import { eliminarImagenBiografia, subirImagenBiografia } from "@/lib/biografiaImagenes";
import type { BiografiaFase } from "@/lib/biografia";

const iconoClase = "h-4 w-4";

export default function BiografiaFaseRow({
  fase,
  esPrimero,
  esUltimo,
  onEliminar,
  onMover,
}: {
  fase: BiografiaFase;
  esPrimero: boolean;
  esUltimo: boolean;
  onEliminar: (id: string) => void;
  onMover: (direccion: "arriba" | "abajo") => void;
}) {
  const [year, setYear] = useState(fase.year);
  const [titulo, setTitulo] = useState(fase.titulo);
  const [texto, setTexto] = useState(fase.texto);
  const [fotoUrl, setFotoUrl] = useState(fase.foto_url);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function guardar() {
    setError(null);
    setGuardando(true);

    const { error: errorUpdate } = await supabase
      .from("biografia_fases")
      .update({ year: year.trim(), titulo: titulo.trim(), texto: texto.trim() })
      .eq("id", fase.id);

    setGuardando(false);
    if (errorUpdate) {
      setError(errorUpdate.message);
      return;
    }
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  }

  async function cambiarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setError(null);
    setSubiendoFoto(true);

    const { url, error: errorSubida } = await subirImagenBiografia(archivo);
    if (errorSubida || !url) {
      setError(errorSubida ?? "No se pudo subir la imagen.");
      setSubiendoFoto(false);
      return;
    }

    const { error: errorUpdate } = await supabase
      .from("biografia_fases")
      .update({ foto_url: url })
      .eq("id", fase.id);

    setSubiendoFoto(false);
    if (errorUpdate) {
      setError(errorUpdate.message);
      return;
    }

    const anterior = fotoUrl;
    setFotoUrl(url);
    if (anterior) await eliminarImagenBiografia(anterior);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la era "${fase.titulo}"?`)) return;

    const { error: errorDelete } = await supabase
      .from("biografia_fases")
      .delete()
      .eq("id", fase.id);

    if (errorDelete) {
      alert(`No se pudo eliminar: ${errorDelete.message}`);
      return;
    }

    if (fotoUrl) await eliminarImagenBiografia(fotoUrl);
    onEliminar(fase.id);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-black/8 px-4 py-4 dark:border-white/[.145] sm:flex-row">
      <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        {fotoUrl && <Image src={fotoUrl} alt="" fill className="object-cover" />}
        <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-black/60 px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-widest text-white hover:bg-black/80">
          {subiendoFoto ? "..." : "Cambiar"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={subiendoFoto}
            onChange={cambiarFoto}
          />
        </label>
      </div>

      <div className="flex-1 space-y-3">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
          <div>
            <label className={etiquetaClaseFuerte}>Año</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={campoClaseRedondeado}
            />
          </div>
        </div>

        <div>
          <label className={etiquetaClaseFuerte}>Texto</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={2}
            className={campoClaseRedondeado}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          {guardado && <span className="text-xs text-green-600 dark:text-green-400">Guardado.</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-3 text-zinc-500 dark:text-zinc-400 sm:flex-col">
        <button
          type="button"
          onClick={() => onMover("arriba")}
          disabled={esPrimero}
          aria-label="Mover arriba"
          className="hover:text-blue-600 disabled:opacity-30 dark:hover:text-blue-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onMover("abajo")}
          disabled={esUltimo}
          aria-label="Mover abajo"
          className="hover:text-blue-600 disabled:opacity-30 dark:hover:text-blue-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={eliminar}
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
  );
}
