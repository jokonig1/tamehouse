"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { eliminarImagenHero } from "@/lib/heroImagenes";
import type { HeroSlide } from "@/lib/heroSlides";

interface HeroSlideRowProps {
  slide: HeroSlide;
  esPrimero: boolean;
  esUltimo: boolean;
  onEliminar: (id: string) => void;
  onMover: (direccion: "arriba" | "abajo") => void;
}

const iconoClase = "h-4 w-4";

export default function HeroSlideRow({
  slide,
  esPrimero,
  esUltimo,
  onEliminar,
  onMover,
}: HeroSlideRowProps) {
  const [focoMovilX, setFocoMovilX] = useState(slide.foco_movil_x);

  async function guardarFoco(valor: number) {
    const { error } = await supabase
      .from("hero_slides")
      .update({ foco_movil_x: valor })
      .eq("id", slide.id);

    if (error) {
      setFocoMovilX(slide.foco_movil_x);
      alert(`No se pudo actualizar: ${error.message}`);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar esta imagen del hero?")) return;

    const { error } = await supabase.from("hero_slides").delete().eq("id", slide.id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }

    await eliminarImagenHero(slide.url);
    onEliminar(slide.id);
  }

  return (
    <div className="flex flex-col gap-4 border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145] sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          <Image src={slide.url} alt="" fill className="object-cover" />
        </div>
        <div className="relative h-24 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-black/10 dark:bg-zinc-800 dark:ring-white/20">
          <Image
            src={slide.url}
            alt=""
            fill
            style={{ objectPosition: `${focoMovilX}% top` }}
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center gap-3">
        <span className="shrink-0 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          Foco mobile
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={focoMovilX}
          onChange={(e) => setFocoMovilX(Number(e.target.value))}
          onMouseUp={(e) => guardarFoco(Number((e.target as HTMLInputElement).value))}
          onTouchEnd={(e) => guardarFoco(Number((e.target as HTMLInputElement).value))}
          className="h-2 w-full max-w-xs accent-blue-600"
          aria-label="Punto focal horizontal en mobile"
        />
        <span className="w-9 shrink-0 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
          {focoMovilX}%
        </span>
      </div>

      <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 sm:ml-auto">
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
