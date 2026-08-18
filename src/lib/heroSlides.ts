import { supabase } from "@/lib/supabase";

export type HeroSlide = {
  id: string;
  url: string;
  logo_oscuro: boolean;
  orden: number;
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await supabase
    .from("hero_slides")
    .select("id, url, logo_oscuro, orden")
    .order("orden", { ascending: true });

  return data ?? [];
}
