import EmbedBox from "@/components/EmbedBox";
import { getConfiguracionMusica } from "@/lib/musica";

export default async function Page() {
  const configuracion = await getConfiguracionMusica();
  const spotifyUrl = configuracion.spotify_url;
  const videoUrl = configuracion.youtube_url;
  const videoUrl2 = configuracion.youtube_url_2 ?? null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
            Música
          </h1>
        </div>

        <div className="mt-5">
          <EmbedBox url={spotifyUrl} tipo="spotify" titulo="Reproductor de Spotify" />
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="grid grid-cols-2 gap-4">
            <EmbedBox url={videoUrl} tipo="video" titulo="Video oficial" />
            <EmbedBox url={videoUrl2} tipo="video" titulo="Video oficial" />
          </div>
        </div>
      </div>
    </div>
  );
}
