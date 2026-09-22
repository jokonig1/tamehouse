"use client";

import { useRef, useState } from "react";
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
  const [ajustando, setAjustando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  function calcularFoco(clientX: number) {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return focoMovilX;
    const porcentaje = ((clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, Math.round(porcentaje)));
  }

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

  function iniciarArrastre(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastrando(true);
    setFocoMovilX(calcularFoco(e.clientX));
  }

  function moverArrastre(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrastrando) return;
    setFocoMovilX(calcularFoco(e.clientX));
  }

  function soltarArrastre(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrastrando) return;
    setArrastrando(false);
    guardarFoco(calcularFoco(e.clientX));
  }

  function ajustarConTeclado(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const nuevoValor = Math.max(
      0,
      Math.min(100, focoMovilX + (e.key === "ArrowLeft" ? -1 : 1))
    );
    setFocoMovilX(nuevoValor);
    guardarFoco(nuevoValor);
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
    <div className="border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145]">
      <div className="flex items-center gap-6">
        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          <Image src={slide.url} alt="" fill className="object-cover" />
        </div>

        <button
          type="button"
          onClick={() => setAjustando((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
            ajustando
              ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
              : "border-black/8 text-zinc-600 hover:opacity-70 dark:border-white/[.145] dark:text-zinc-400"
          }`}
        >
          Foco mobile · {focoMovilX}%
        </button>

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

      {ajustando && (
        <div className="mt-4 flex flex-col items-start gap-2 border-t border-black/8 pt-4 dark:border-white/[.145]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Arrastra la línea para elegir qué parte de la foto se ve al recortarla en mobile.
          </p>
          <div
            ref={previewRef}
            role="slider"
            tabIndex={0}
            aria-label="Punto focal horizontal en mobile"
            aria-valuenow={focoMovilX}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={iniciarArrastre}
            onPointerMove={moverArrastre}
            onPointerUp={soltarArrastre}
            onKeyDown={ajustarConTeclado}
            className="relative h-72 w-40 cursor-ew-resize touch-none overflow-hidden rounded-md bg-zinc-100 ring-1 ring-black/10 select-none dark:bg-zinc-800 dark:ring-white/20"
          >
            <Image
              src={slide.url}
              alt=""
              fill
              style={{ objectPosition: `${focoMovilX}% top` }}
              className="pointer-events-none object-cover"
            />
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
              style={{ left: `${focoMovilX}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
