import Image from "next/image";
import type { Show } from "@/lib/shows";

const formatoFecha = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ShowCard({ show }: { show: Show }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-black">
      <span aria-hidden className="absolute left-8 top-10 h-2 w-2 rounded-full bg-black/10" />
      <span aria-hidden className="absolute right-10 top-16 h-1.5 w-1.5 rounded-full bg-red-500/60" />
      <span aria-hidden className="absolute left-1/3 bottom-10 h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
      <span aria-hidden className="absolute right-1/4 bottom-16 h-2 w-2 rounded-full bg-black/10" />

      <div className="relative mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-10 px-6 py-12 sm:grid-cols-2 sm:px-10">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-lg bg-zinc-100 shadow-xl">
          {show.imagen_url ? (
            <Image
              src={show.imagen_url}
              alt={`Afiche ${show.ciudad}`}
              fill
              sizes="280px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 border border-black/10 p-6 text-center">
              <p className="text-2xl leading-none font-extrabold tracking-tight uppercase">
                Aerstame
              </p>
              <div className="h-px w-10 bg-black/20" />
              <p className="text-sm font-medium tracking-widest uppercase text-black/60">
                {show.ciudad}
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            Aerstame <span className="mx-1 text-black/30">|</span> {show.ciudad}
          </h2>

          <dl className="mt-6 flex flex-col gap-2 text-sm">
            {show.lugar && (
              <div className="flex gap-1.5">
                <dt className="font-semibold">Lugar:</dt>
                <dd className="text-black/70">{show.lugar}</dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="font-semibold">Ciudad:</dt>
              <dd className="text-black/70">{show.ciudad}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="font-semibold">Día:</dt>
              <dd className="text-black/70">{formatoFecha.format(new Date(show.fecha))}</dd>
            </div>
          </dl>

          {show.link_entradas && (
            <a
              href={show.link_entradas}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            >
              Comprar boletos
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
