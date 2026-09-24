import Image from "next/image";
import type { Show } from "@/lib/shows";

function partesFecha(fecha: string) {
  const partes = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(fecha));

  const dia = partes.find((p) => p.type === "day")?.value ?? "";
  const mes = (partes.find((p) => p.type === "month")?.value ?? "").replace(".", "");
  const anio = partes.find((p) => p.type === "year")?.value ?? "";

  return { dia, mes: mes.toUpperCase(), anio };
}

export default function ShowCard({ show }: { show: Show }) {
  const { dia, mes, anio } = partesFecha(show.fecha);
  const diaConCero = dia.padStart(2, "0");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none text-[13rem] leading-none font-black text-white/10 sm:block"
      >
        {diaConCero}
      </span>

      <div className="relative grid grid-cols-1 gap-8 p-6 sm:grid-cols-[220px_1fr] sm:p-10">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-lg bg-zinc-800 shadow-xl">
          {show.imagen_url ? (
            <Image
              src={show.imagen_url}
              alt={`Afiche ${show.titulo}`}
              fill
              sizes="220px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 border border-white/10 p-6 text-center">
              <p className="text-2xl leading-none font-extrabold tracking-tight text-white uppercase">
                {show.titulo}
              </p>
              <div className="h-px w-10 bg-white/20" />
              <p className="text-sm font-medium tracking-widest text-white/60 uppercase">
                {show.ciudad}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-[0.3em] text-white/50 uppercase">
            Tour Aerstame
          </span>
          <h2 className="mt-1 text-4xl leading-none font-extrabold tracking-tight text-white uppercase sm:text-6xl">
            {show.titulo}
          </h2>

          <div className="mt-5 flex items-center gap-2 text-sm text-white/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-4 w-4 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
              />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {show.lugar && <span className="font-semibold text-white">{show.lugar}</span>}
            <span>
              {show.lugar ? "·" : ""} {show.ciudad}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-4">
            <div className="flex items-end gap-3">
              <span className="text-6xl leading-none font-black text-white">{dia}</span>
              <div className="flex flex-col pb-1 text-sm leading-tight font-bold uppercase">
                <span className="text-white">{mes}</span>
                <span className="text-white/50">{anio}</span>
              </div>
            </div>

            {show.hora && (
              <>
                <div className="h-10 w-px bg-white/15" />
                <div className="flex flex-col pb-1 text-sm leading-tight font-bold uppercase">
                  <span className="text-white">{show.hora}</span>
                  <span className="text-white/50">Hrs</span>
                </div>
              </>
            )}
          </div>

          {show.link_entradas && (
            <a
              href={show.link_entradas}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold tracking-wide text-black uppercase transition-opacity hover:opacity-90"
            >
              Comprar entradas
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
