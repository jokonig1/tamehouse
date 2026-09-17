import { supabase } from "@/lib/supabase";

export type BiografiaFase = {
  id: string;
  year: string;
  titulo: string;
  texto: string;
  foto_url: string | null;
  orden: number;
};

export type BiografiaFoto = {
  id: string;
  url: string;
  orden: number;
};

export async function getBiografiaFases(): Promise<BiografiaFase[]> {
  const { data } = await supabase
    .from("biografia_fases")
    .select("id, year, titulo, texto, foto_url, orden")
    .order("orden", { ascending: true });

  return data ?? [];
}

export async function getBiografiaGaleria(): Promise<BiografiaFoto[]> {
  const { data } = await supabase
    .from("biografia_galeria")
    .select("id, url, orden")
    .order("orden", { ascending: true });

  return data ?? [];
}
