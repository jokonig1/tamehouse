import EmbedBox from "@/components/EmbedBox";
import ShowList from "@/components/ShowList";
import { getProximosShows } from "@/lib/shows";

// TODO: traer desde Supabase cuando el panel de admin permita cargar
// el link de Spotify y el video oficial (todavia no existe ese campo).
const spotifyUrl: string | null = null;
const videoUrl: string | null = null;

export default async function Page() {
  const shows = await getProximosShows();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Música
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
                Escuchar en Spotify
              </h2>
              <div className="mt-3">
                <EmbedBox url={spotifyUrl} tipo="spotify" titulo="Reproductor de Spotify" />
              </div>
            </div>

            <div>
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
                Último video oficial
              </h2>
              <div className="mt-3">
                <EmbedBox url={videoUrl} tipo="video" titulo="Último video oficial" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
              Próximas fechas
            </h2>
            <div className="mt-3">
              <ShowList shows={shows} variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
