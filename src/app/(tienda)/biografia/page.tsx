"use client";

import Image from "next/image";
import { useRef } from "react";

const FASES = [
  {
    year: "2018",
    titulo: "Los inicios",
    texto:
      "Primeras canciones grabadas en casa y los primeros shows en bares pequeños, buscando un sonido propio.",
    fotos: ["tamehouse-2018-a", "tamehouse-2018-b", "tamehouse-2018-c"],
    notas: ["Grabado en la pieza,\na las 2 de la mañana", "Primer show,\nsala a medias"],
  },
  {
    year: "2021",
    titulo: "El quiebre",
    texto:
      "El primer álbum y una gira que llenó salas medianas por primera vez. El proyecto empezó a tomar forma propia.",
    fotos: ["tamehouse-2021-a", "tamehouse-2021-b", "tamehouse-2021-c"],
    notas: ["Grabando el álbum,\ntoma 14", "La gira:\n30 ciudades"],
  },
  {
    year: "2023",
    titulo: "La consagración",
    texto:
      "Estadios llenos y el reconocimiento del público masivo. La música empezó a viajar más allá de las fronteras.",
    fotos: ["tamehouse-2023-a", "tamehouse-2023-b", "tamehouse-2023-c"],
    notas: ["Primer estadio,\nlleno total", "Festival,\notro país"],
  },
  {
    year: "2026",
    titulo: "Hoy",
    texto:
      "Una nueva era, nueva música y una tienda oficial para quienes acompañan el proyecto desde siempre.",
    fotos: ["tamehouse-2026-a", "tamehouse-2026-b", "tamehouse-2026-c"],
    notas: ["Nueva música,\nen camino", "La tienda,\npara ustedes"],
  },
];

function Polaroid({
  seed,
  orientacion = "portrait",
  rotate = 0,
  className = "",
}: {
  seed: string;
  orientacion?: "portrait" | "landscape";
  rotate?: number;
  className?: string;
}) {
  const ancho = orientacion === "portrait" ? 96 : 128;
  const alto = orientacion === "portrait" ? 128 : 96;

  return (
    <div
      className={`shrink-0 rounded-sm bg-white p-2 pb-5 shadow-lg select-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Image
        src={`https://picsum.photos/seed/${seed}/${ancho * 2}/${alto * 2}`}
        alt=""
        width={ancho}
        height={alto}
        className={`pointer-events-none rounded-xs object-cover ${
          orientacion === "portrait" ? "aspect-3/4 w-24" : "aspect-4/3 w-32"
        }`}
      />
    </div>
  );
}

function NotaManuscrita({
  texto,
  rotate = -4,
  className = "",
}: {
  texto: string;
  rotate?: number;
  className?: string;
}) {
  return (
    <p
      className={`pointer-events-none absolute font-handwriting text-xl leading-tight text-stone-500 select-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {texto.split("\n").map((linea, i) => (
        <span key={i} className="block">
          {linea}
        </span>
      ))}
    </p>
  );
}

function EraEscena({ fase }: { fase: (typeof FASES)[number] }) {
  const [f1, f2, f3] = fase.fotos;
  const [nota1, nota2] = fase.notas;

  return (
    <div
      id={`era-${fase.year}`}
      className="flex w-[min(95vw,780px)] shrink-0 items-center gap-10 px-4"
    >
      <div className="relative flex w-80 shrink-0 items-center justify-center py-12">
        <Polaroid seed={f1} orientacion="portrait" rotate={-8} className="-mr-4 translate-y-3" />
        <Polaroid seed={f2} orientacion="landscape" rotate={3} className="z-10" />
        <Polaroid seed={f3} orientacion="portrait" rotate={7} className="-ml-4 -translate-y-4" />

        <NotaManuscrita texto={nota1} rotate={-6} className="-top-2 -left-6" />
        <NotaManuscrita texto={nota2} rotate={4} className="-right-6 -bottom-2 text-right" />
      </div>

      <div className="min-w-0 max-w-xs">
        <span className="text-xs font-medium tracking-[0.3em] text-stone-400 uppercase">
          {fase.year}
        </span>
        <h2 className="mt-3 font-serif text-4xl italic">{fase.titulo}</h2>
        <p className="mt-4 leading-relaxed text-stone-600">{fase.texto}</p>
      </div>
    </div>
  );
}

export default function Page() {
  const trackRef = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);
  const inicioX = useRef(0);
  const inicioScroll = useRef(0);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!trackRef.current) return;
    arrastrando.current = true;
    inicioX.current = e.clientX;
    inicioScroll.current = trackRef.current.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!arrastrando.current || !trackRef.current) return;
    trackRef.current.scrollLeft = inicioScroll.current - (e.clientX - inicioX.current);
  }

  function onPointerUp() {
    arrastrando.current = false;
  }

  function irAEra(year: string) {
    document
      .getElementById(`era-${year}`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function desplazar(direccion: -1 | 1) {
    trackRef.current?.scrollBy({ left: direccion * 700, behavior: "smooth" });
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-6xl px-6 pt-12">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Biografía
        </h1>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="mt-10 flex cursor-grab touch-pan-y gap-16 overflow-x-auto px-[8vw] pt-8 pb-6 scrollbar-none active:cursor-grabbing"
      >
        {FASES.map((fase) => (
          <EraEscena key={fase.year} fase={fase} />
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center gap-4 px-6 pb-12">
        <button
          type="button"
          onClick={() => desplazar(-1)}
          aria-label="Ver anterior"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="flex gap-2 overflow-x-auto">
          {FASES.map((fase) => (
            <button
              key={fase.year}
              type="button"
              onClick={() => irAEra(fase.year)}
              aria-label={`Ir a ${fase.titulo}`}
              className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md hover:opacity-80"
            >
              <Image
                src={`https://picsum.photos/seed/${fase.fotos[0]}/128/96`}
                alt=""
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => desplazar(1)}
          aria-label="Ver siguiente"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
