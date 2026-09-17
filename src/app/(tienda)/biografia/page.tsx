"use client";

import Image from "next/image";

const FASES = [
  {
    year: "2018",
    titulo: "Los inicios",
    texto:
      "Primeras canciones grabadas en casa y los primeros shows en bares pequeños, buscando un sonido propio.",
    foto: "tamehouse-2018-a",
  },
  {
    year: "2021",
    titulo: "El quiebre",
    texto:
      "El primer álbum y una gira que llenó salas medianas por primera vez. El proyecto empezó a tomar forma propia.",
    foto: "tamehouse-2021-a",
  },
  {
    year: "2023",
    titulo: "La consagración",
    texto:
      "Estadios llenos y el reconocimiento del público masivo. La música empezó a viajar más allá de las fronteras.",
    foto: "tamehouse-2023-a",
  },
  {
    year: "2026",
    titulo: "Hoy",
    texto:
      "Una nueva era, nueva música y una tienda oficial para quienes acompañan el proyecto desde siempre.",
    foto: "tamehouse-2026-a",
  },
];

function Seccion({ fase, indice }: { fase: (typeof FASES)[number]; indice: number }) {
  const invertido = indice % 2 === 1;

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-4 select-none text-center font-serif text-[20vw] leading-none font-bold text-stone-900/[0.04] sm:text-[9rem]"
      >
        {fase.titulo}
      </span>

      <div
        className={`relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 sm:flex-row sm:gap-16 ${
          invertido ? "sm:flex-row-reverse" : ""
        }`}
      >
        <div className="relative w-full max-w-sm shrink-0">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-stone-200">
            <Image
              src={`https://picsum.photos/seed/${fase.foto}/600/800`}
              alt={fase.titulo}
              fill
              sizes="(min-width: 640px) 384px, 90vw"
              className="object-cover"
            />
          </div>
          <span
            aria-hidden
            className={`absolute -bottom-4 h-10 w-10 bg-rose-500 ${invertido ? "-right-4" : "-left-4"}`}
          />
        </div>

        <div className="relative min-w-0 flex-1 text-center sm:text-left">
          <span className="text-xs font-medium tracking-[0.3em] text-stone-400 uppercase">
            {fase.year}
          </span>
          <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">{fase.titulo}</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-stone-600 sm:mx-0">
            {fase.texto}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-6xl px-6 pt-12">
        <span className="text-xs font-medium tracking-[0.3em] text-stone-400 uppercase">
          Nuestra historia
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Biografía
        </h1>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-stone-200">
        {FASES.map((fase, i) => (
          <Seccion key={fase.year} fase={fase} indice={i} />
        ))}
      </div>
    </div>
  );
}
