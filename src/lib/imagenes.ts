import { supabase } from "@/lib/supabase";
import type { ProductoImagen } from "@/lib/types";

const BUCKET = "productos";

function rutaDesdeUrl(url: string): string | null {
  const marcador = `/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);
  return indice === -1 ? null : url.slice(indice + marcador.length);
}

export async function subirImagenProducto(
  productoId: string,
  archivo: File,
  orden: number
): Promise<{ error?: string }> {
  const extension = archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${productoId}/${crypto.randomUUID()}.${extension}`;

  const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo);
  if (errorSubida) return { error: errorSubida.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(ruta);

  const { error: errorInsert } = await supabase
    .from("producto_imagenes")
    .insert({ producto_id: productoId, url: publicUrl, orden });

  if (errorInsert) return { error: errorInsert.message };
  return {};
}

export async function eliminarImagenProducto(imagen: ProductoImagen): Promise<{ error?: string }> {
  const ruta = rutaDesdeUrl(imagen.url);
  if (ruta) {
    await supabase.storage.from(BUCKET).remove([ruta]);
  }

  const { error } = await supabase.from("producto_imagenes").delete().eq("id", imagen.id);
  if (error) return { error: error.message };
  return {};
}
