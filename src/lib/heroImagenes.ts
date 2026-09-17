import { supabase } from "@/lib/supabase";

const BUCKET = "hero";

function rutaDesdeUrl(url: string): string | null {
  const marcador = `/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);
  return indice === -1 ? null : url.slice(indice + marcador.length);
}

export async function subirImagenHero(archivo: File): Promise<{ url?: string; error?: string }> {
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${crypto.randomUUID()}.${extension}`;

  const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo);
  if (errorSubida) return { error: errorSubida.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(ruta);

  return { url: publicUrl };
}

export async function eliminarImagenHero(url: string): Promise<{ error?: string }> {
  const ruta = rutaDesdeUrl(url);
  if (ruta) {
    const { error } = await supabase.storage.from(BUCKET).remove([ruta]);
    if (error) return { error: error.message };
  }
  return {};
}
