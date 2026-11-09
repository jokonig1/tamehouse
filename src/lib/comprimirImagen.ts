// Comprime una foto en el navegador antes de subirla a Supabase Storage:
// la achica para que su lado más largo no pase de `ladoMax` y la convierte
// a WebP. Así una foto de celular de varios MB queda en unos cientos de KB
// y no gastamos el espacio ni el tráfico del plan gratis de Supabase, sin
// depender de que quien la sube se acuerde de comprimirla antes.
//
// Corre en el navegador del admin (usa canvas), así que no consume nada
// del servidor. Lo mismo hace scripts/cargar-catalogo.mjs con sharp para
// la carga masiva; los tamaños de acá deben calzar con los de ese script.

export const TAMANO_PRODUCTO_GRANDE = 1600;
export const TAMANO_PRODUCTO_MINIATURA = 800;
export const TAMANO_HERO = 1920;
export const TAMANO_AFICHE_SHOW = 1200;

const CALIDAD = 0.8;

export interface ImagenComprimida {
  blob: Blob;
  extension: "webp" | "jpg";
  contentType: "image/webp" | "image/jpeg";
}

function esHeic(archivo: File): boolean {
  return /\.(heic|heif)$/i.test(archivo.name) || /image\/hei[cf]/i.test(archivo.type);
}

function canvasABlob(canvas: HTMLCanvasElement, tipo: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, tipo, CALIDAD));
}

export async function comprimirImagen(archivo: File, ladoMax: number): Promise<ImagenComprimida> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      esHeic(archivo)
        ? `"${archivo.name}" es una foto HEIC de iPhone y el navegador no la puede leer. Expórtala como JPG o PNG y vuelve a subirla.`
        : `No se pudo leer "${archivo.name}". Prueba con una foto JPG, PNG o WebP.`
    );
  }

  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * escala));
  canvas.height = Math.max(1, Math.round(bitmap.height * escala));

  const contexto = canvas.getContext("2d");
  if (!contexto) {
    bitmap.close();
    throw new Error("El navegador no permitió procesar la imagen.");
  }
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await canvasABlob(canvas, "image/webp");
  if (webp && webp.type === "image/webp") {
    return { blob: webp, extension: "webp", contentType: "image/webp" };
  }

  // Algunos Safari no saben generar WebP y devuelven PNG (que pesa más
  // que la original). En ese caso, JPEG sobre fondo blanco para que las
  // partes transparentes no queden negras.
  contexto.globalCompositeOperation = "destination-over";
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  const jpeg = await canvasABlob(canvas, "image/jpeg");
  if (!jpeg) throw new Error(`No se pudo comprimir "${archivo.name}".`);
  return { blob: jpeg, extension: "jpg", contentType: "image/jpeg" };
}

// Opciones de subida comunes: tipo correcto y caché de un año en el CDN de
// Supabase (cada foto tiene nombre único, así que nunca cambia en el mismo
// archivo). Lo cacheado cuenta aparte en la cuota de tráfico.
export function opcionesSubida(imagen: ImagenComprimida) {
  return { contentType: imagen.contentType, cacheControl: "31536000" };
}
