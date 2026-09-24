import { supabase } from "@/lib/supabase";

export type Show = {
  id: string;
  fecha: string;
  ciudad: string;
  lugar: string | null;
  link_entradas: string | null;
  imagen_url?: string | null;
};

export async function getProximosShows(limit?: number): Promise<Show[]> {
  let query = supabase
    .from("shows")
    .select("id, fecha, ciudad, lugar, link_entradas, imagen_url")
    .gte("fecha", new Date().toISOString().slice(0, 10))
    .order("fecha", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;

  return data ?? [];
}
