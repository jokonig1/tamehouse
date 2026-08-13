import ShowList from "@/components/ShowList";
import { getProximosShows } from "@/lib/shows";

export default async function Page() {
  const shows = await getProximosShows();

  return (
    <div className="bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Música
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
                Escuchar en Spotify
              </h2>
              <div className="mt-3 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 py-10">
                <p className="text-sm text-white/50">Próximamente</p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
                Último video oficial
              </h2>
              <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <p className="text-sm text-white/50">Próximamente</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
              Próximas fechas
            </h2>
            <div className="mt-4">
              <ShowList shows={shows} variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
