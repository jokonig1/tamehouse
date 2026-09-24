import { supabase } from "@/lib/supabase";

export type Show = {
  id: string;
  fecha: string;
  hora: string | null;
  ciudad: string;
  lugar: string | null;
  link_entradas: string | null;
  imagen_url?: string | null;
  titulo: string;
};

export async function getProximosShows(limit?: number): Promise<Show[]> {
  let query = supabase
    .from("shows")
    .select("id, fecha, hora, ciudad, lugar, link_entradas, imagen_url, titulo")
    .gte("fecha", new Date().toISOString().slice(0, 10))
    .order("fecha", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;

  return data ?? [];
}
