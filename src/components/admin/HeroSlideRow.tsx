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
  const [logoOscuro, setLogoOscuro] = useState(slide.logo_oscuro);
  const [guardando, setGuardando] = useState(false);

  async function alternarLogoOscuro() {
    const nuevoValor = !logoOscuro;
    setLogoOscuro(nuevoValor);
    setGuardando(true);

    const { error } = await supabase
      .from("hero_slides")
      .update({ logo_oscuro: nuevoValor })
      .eq("id", slide.id);

    setGuardando(false);
    if (error) {
      setLogoOscuro(!nuevoValor);
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
    <div className="flex items-center gap-6 border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145]">
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        <Image src={slide.url} alt="" fill className="object-cover" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={logoOscuro}
          aria-label="Logo oscuro sobre esta imagen"
          disabled={guardando}
          onClick={alternarLogoOscuro}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-wait disabled:opacity-50 ${
            logoOscuro ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              logoOscuro ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          Logo oscuro
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
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
