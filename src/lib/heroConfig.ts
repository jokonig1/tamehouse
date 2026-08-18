import { supabase } from "@/lib/supabase";

export type ConfiguracionHero = {
  titulo: string;
  subtitulo: string;
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

  return data ?? VALORES_POR_DEFECTO;
}
