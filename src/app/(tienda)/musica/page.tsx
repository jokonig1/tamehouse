import EmbedBox from "@/components/EmbedBox";
import { getConfiguracionMusica } from "@/lib/musica";

export default async function Page() {
  const configuracion = await getConfiguracionMusica();
  const spotifyUrl = configuracion.spotify_url;
  const videoUrl = configuracion.youtube_url;
  const videoUrl2 = configuracion.youtube_url_2 ?? null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-6">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
          Música
        </h1>

        <div className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
            Escuchar en Spotify
          </h2>
          <div className="mt-3">
            <EmbedBox url={spotifyUrl} tipo="spotify" titulo="Reproductor de Spotify" />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-white/70">
            Videos
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <EmbedBox url={videoUrl} tipo="video" titulo="Video oficial" />
            <EmbedBox url={videoUrl2} tipo="video" titulo="Video oficial" />
          </div>
        </div>
      </div>
    </div>
  );
}
