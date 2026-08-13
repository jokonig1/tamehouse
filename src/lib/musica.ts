import { supabase } from "@/lib/supabase";

export type ConfiguracionMusica = {
  spotify_url: string | null;
  youtube_url: string | null;
};

function aSpotifyEmbed(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!hostname.endsWith("spotify.com")) return null;
    const match = pathname.match(/(track|album|artist|playlist|episode|show)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
  } catch {
    return null;
  }
}

function aYoutubeEmbed(url: string): string | null {
  try {
    const { hostname, pathname, searchParams } = new URL(url);

    if (hostname.endsWith("youtu.be")) {
      const id = pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (hostname.endsWith("youtube.com")) {
      if (pathname.startsWith("/embed/")) return url;
      const id = searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}

// Devuelve los links ya convertidos a URL embebible (listos para
// pasarle directo a un <iframe>), o null si no hay link guardado
// o no se pudo reconocer el formato.
export async function getConfiguracionMusica(): Promise<ConfiguracionMusica> {
  const { data } = await supabase
    .from("configuracion_musica")
    .select("spotify_url, youtube_url")
    .eq("id", 1)
    .single();

  return {
    spotify_url: data?.spotify_url ? aSpotifyEmbed(data.spotify_url) : null,
    youtube_url: data?.youtube_url ? aYoutubeEmbed(data.youtube_url) : null,
  };
}
