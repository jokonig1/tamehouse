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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:hidden">
            Música
          </h1>
          <h1 className="hidden shrink-0 flex-col items-center text-4xl leading-[0.95] font-extrabold uppercase tracking-tight sm:flex">
            {"MÚSICA".split("").map((letra, i) => (
              <span key={i}>{letra}</span>
            ))}
          </h1>

          <div className="min-w-0 flex-1">
            <EmbedBox url={spotifyUrl} tipo="spotify" titulo="Reproductor de Spotify" />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <EmbedBox url={videoUrl} tipo="video" titulo="Video oficial" />
              <EmbedBox url={videoUrl2} tipo="video" titulo="Video oficial" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
