import { supabase } from "@/lib/supabase";
import type { ProductoImagen } from "@/lib/types";
import {
  comprimirImagen,
  opcionesSubida,
  TAMANO_PRODUCTO_GRANDE,
  TAMANO_PRODUCTO_MINIATURA,
  type ImagenComprimida,
} from "@/lib/comprimirImagen";

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
  let grande: ImagenComprimida;
  let miniatura: ImagenComprimida;
  try {
    [grande, miniatura] = await Promise.all([
      comprimirImagen(archivo, TAMANO_PRODUCTO_GRANDE),
      comprimirImagen(archivo, TAMANO_PRODUCTO_MINIATURA),
    ]);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo procesar la imagen." };
  }

  // Misma convención que scripts/cargar-catalogo.mjs: "-full" para la
  // ficha de producto y "-thumb" para catálogo, carrito y home.
  const base = `${productoId}/${crypto.randomUUID()}`;
  const rutaGrande = `${base}-full.${grande.extension}`;
  const rutaMiniatura = `${base}-thumb.${miniatura.extension}`;
  const storage = supabase.storage.from(BUCKET);

  const { error: errorSubida } = await storage.upload(rutaGrande, grande.blob, opcionesSubida(grande));
  if (errorSubida) return { error: errorSubida.message };

  const { error: errorMiniatura } = await storage.upload(rutaMiniatura, miniatura.blob, opcionesSubida(miniatura));
  if (errorMiniatura) {
    await storage.remove([rutaGrande]);
    return { error: errorMiniatura.message };
  }

  const {
    data: { publicUrl },
  } = storage.getPublicUrl(rutaGrande);

  const { error: errorInsert } = await supabase
    .from("producto_imagenes")
    .insert({ producto_id: productoId, url: publicUrl, orden });

  if (errorInsert) {
    await storage.remove([rutaGrande, rutaMiniatura]);
    return { error: errorInsert.message };
  }
  return {};
}

export async function eliminarImagenProducto(imagen: ProductoImagen): Promise<{ error?: string }> {
  const ruta = rutaDesdeUrl(imagen.url);
  if (ruta) {
    // Las fotos subidas desde el panel o con scripts/cargar-catalogo.mjs
    // tienen una miniatura al lado (mismo nombre, "-thumb" en vez de "-full").
    const conMiniatura = /-full\.(webp|jpg)$/;
    const rutas = conMiniatura.test(ruta) ? [ruta, ruta.replace(conMiniatura, "-thumb.$1")] : [ruta];
    await supabase.storage.from(BUCKET).remove(rutas);
  }

  const { error } = await supabase.from("producto_imagenes").delete().eq("id", imagen.id);
  if (error) return { error: error.message };
  return {};
}
