import { supabase } from "@/lib/supabase";

export type ConfiguracionMusica = {
  spotify_url: string | null;
  youtube_url: string | null;
};

export async function getConfiguracionMusica(): Promise<ConfiguracionMusica> {
  const { data } = await supabase
    .from("configuracion_musica")
    .select("spotify_url, youtube_url")
    .eq("id", 1)
    .single();

  return data ?? { spotify_url: null, youtube_url: null };
}
