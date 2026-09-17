import { supabase } from "@/lib/supabase";

export type ConfiguracionHero = {
  titulo: string | null;
  subtitulo: string | null;
};

const VALORES_POR_DEFECTO: ConfiguracionHero = {
  titulo: "Aerstame",
  subtitulo: "Merchandising oficial",
};

export async function getConfiguracionHero(): Promise<ConfiguracionHero> {
  const { data } = await supabase
    .from("configuracion_hero")
    .select("titulo, subtitulo")
    .eq("id", 1)
    .single();

  if (!data) return VALORES_POR_DEFECTO;
  return { titulo: data.titulo, subtitulo: data.subtitulo };
}
