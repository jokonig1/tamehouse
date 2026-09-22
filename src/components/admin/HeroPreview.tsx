"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/heroSlides";

interface HeroPreviewProps {
  slides: HeroSlide[];
  titulo: string;
  subtitulo: string;
}

const INTERVALO_MS = 5000;

function IconoMobile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

function IconoEscritorio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconoHamburguesa({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconoBuscar({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconoUsuario({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function IconoCarrito({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 7V6a6 6 0 1 1 12 0v1M3.5 7h17l-1.2 13.2a2 2 0 0 1-2 1.8H6.7a2 2 0 0 1-2-1.8L3.5 7Z" />
    </svg>
  );
}

export default function HeroPreview({ slides, titulo, subtitulo }: HeroPreviewProps) {
  const [modo, setModo] = useState<"mobile" | "desktop">("mobile");
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia si cambia la cantidad de slides
    setIndice(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % slides.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [slides.length]);

  const slideActual = slides[indice] ?? null;
  const esMobile = modo === "mobile";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Previsualización
        </h2>
        <div className="inline-flex rounded-full border border-black/8 p-1 dark:border-white/[.145]">
          <button
            type="button"
            onClick={() => setModo("mobile")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              esMobile
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:opacity-70 dark:text-zinc-400"
            }`}
          >
            <IconoMobile />
            Mobile
          </button>
          <button
            type="button"
            onClick={() => setModo("desktop")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              !esMobile
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:opacity-70 dark:text-zinc-400"
            }`}
          >
            <IconoEscritorio />
            Escritorio
          </button>
        </div>
      </div>

      <div
        className={`relative @container overflow-hidden rounded-lg bg-zinc-950 transition-all ${
          esMobile ? "mx-auto w-full max-w-65 aspect-9/16" : "w-full aspect-video"
        }`}
      >
        {slideActual && (
          <Image
            key={slideActual.url}
            src={slideActual.url}
            alt=""
            fill
            sizes={esMobile ? "260px" : "900px"}
            style={{ objectPosition: esMobile ? `${slideActual.foco_movil_x}% top` : "center top" }}
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Barra del header real (solo referencia visual, no funcional) */}
        <div
          className={`absolute inset-x-0 top-0 z-10 grid grid-cols-3 items-center text-white ${
            esMobile ? "h-9 px-3" : "h-[5.5cqw] px-[3%]"
          }`}
        >
          {esMobile ? (
            <IconoHamburguesa className="h-4 w-4" />
          ) : (
            <nav className="flex items-center gap-[6%] text-[0.85cqw] font-medium uppercase tracking-widest">
              <span>Tienda</span>
              <span>Música</span>
              <span>Biografía</span>
            </nav>
          )}

          <Image
            src="/images/logooficial.png"
            alt=""
            width={1224}
            height={1285}
            className={`justify-self-center object-contain ${esMobile ? "h-10 w-auto" : "h-[6.5cqw] w-auto"}`}
          />

          <div className={`flex items-center justify-end ${esMobile ? "gap-3" : "gap-[6%]"}`}>
            {esMobile ? (
              <>
                <IconoBuscar className="h-4 w-4" />
                <IconoCarrito className="h-4 w-4" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-[3%] text-[0.85cqw] font-medium uppercase tracking-widest">
                  <IconoUsuario className="h-[1.6cqw] w-[1.6cqw]" />
                  <span>Josefa</span>
                </div>
                <IconoCarrito className="h-[1.6cqw] w-[1.6cqw]" />
              </>
            )}
          </div>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 flex flex-col gap-1 p-[4%] ${
            esMobile ? "items-center text-center" : "items-start text-left"
          }`}
        >
          {subtitulo && (
            <span
              className={`font-medium uppercase tracking-[0.3em] text-white/70 ${
                esMobile ? "text-[9px]" : "text-[0.8cqw]"
              }`}
            >
              {subtitulo}
            </span>
          )}
          {titulo && (
            <p
              className={`font-extrabold uppercase leading-[0.85] tracking-tight text-white ${
                esMobile ? "text-4xl" : "text-[6cqw]"
              }`}
            >
              {titulo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
