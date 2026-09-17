import Image from "next/image";
import { getBiografiaFases, getBiografiaGaleria } from "@/lib/biografia";

type FaseMostrada = {
  id: string;
  year: string;
  titulo: string;
  texto: string;
  foto_url: string | null;
};

const FASES_POR_DEFECTO: FaseMostrada[] = [
  {
    id: "2018",
    year: "2018",
    titulo: "Los inicios",
    texto:
      "Primeras canciones grabadas en casa y los primeros shows en bares pequeños, buscando un sonido propio.",
    foto_url: null,
  },
  {
    id: "2021",
    year: "2021",
    titulo: "El quiebre",
    texto:
      "El primer álbum y una gira que llenó salas medianas por primera vez. El proyecto empezó a tomar forma propia.",
    foto_url: null,
  },
  {
    id: "2023",
    year: "2023",
    titulo: "La consagración",
    texto:
      "Estadios llenos y el reconocimiento del público masivo. La música empezó a viajar más allá de las fronteras.",
    foto_url: null,
  },
  {
    id: "2026",
    year: "2026",
    titulo: "Hoy",
    texto:
      "Una nueva era, nueva música y una tienda oficial para quienes acompañan el proyecto desde siempre.",
    foto_url: null,
  },
];

function Seccion({ fase, indice }: { fase: FaseMostrada; indice: number }) {
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
            {fase.foto_url && (
              <Image
                src={fase.foto_url}
                alt={fase.titulo}
                fill
                sizes="(min-width: 640px) 384px, 90vw"
                className="object-cover"
              />
            )}
          </div>
          <span
            aria-hidden
            className={`absolute -bottom-4 h-10 w-10 bg-rose-500 ${invertido ? "-right-4" : "-left-4"}`}
          />
        </div>

        <div className="relative min-w-0 flex-1 text-center sm:text-left">
          {fase.year && (
            <span className="text-xs font-medium tracking-[0.3em] text-stone-400 uppercase">
              {fase.year}
            </span>
          )}
          <h2 className="mt-3 font-serif text-4xl italic sm:text-5xl">{fase.titulo}</h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-stone-600 sm:mx-0">
            {fase.texto}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function Page() {
  const [fasesGuardadas, galeria] = await Promise.all([getBiografiaFases(), getBiografiaGaleria()]);
  const fases = fasesGuardadas.length > 0 ? fasesGuardadas : FASES_POR_DEFECTO;

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
        {fases.map((fase, i) => (
          <Seccion key={fase.id} fase={fase} indice={i} />
        ))}
      </div>

      {galeria.length > 0 && (
        <section className="border-t border-stone-200 px-6 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="text-center text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
              Galería
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {galeria.map((foto) => (
                <div
                  key={foto.id}
                  className="relative aspect-square overflow-hidden rounded-sm bg-stone-200"
                >
                  <Image
                    src={foto.url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
