import { supabase } from "@/lib/supabase";
import type { Producto as ProductoDetalle, ProductoImagen, Variante } from "@/lib/types";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  precioOferta: number | null;
  categoria: string | null;
  imagenUrl: string | null;
  agotado: boolean;
};

// Una oferta vence sola cuando pasa oferta_hasta -- este chequeo se
// repite en todos lados donde se decide el precio (catálogo, ficha,
// carrito), así que queda centralizado acá.
function ofertaVigente(precioOferta: number | null, ofertaHasta: string | null) {
  if (precioOferta === null) return false;
  if (ofertaHasta === null) return true;
  return new Date(ofertaHasta).getTime() > Date.now();
}

export const PRODUCTOS_BOCETO: Producto[] = [
  { id: "boceto-1", nombre: "Polera Tour 2026", precio: 19990, precioOferta: null, categoria: "Poleras", imagenUrl: null, agotado: false },
  { id: "boceto-2", nombre: "Polerón Oversize", precio: 34990, precioOferta: null, categoria: "Poleras", imagenUrl: null, agotado: false },
  { id: "boceto-3", nombre: "Vinilo Edición Limitada", precio: 24990, precioOferta: null, categoria: "Vinilos", imagenUrl: null, agotado: false },
  { id: "boceto-4", nombre: "Gorro Bordado", precio: 14990, precioOferta: null, categoria: "Gorros", imagenUrl: null, agotado: false },
  { id: "boceto-5", nombre: "Poster de Gira", precio: 9990, precioOferta: null, categoria: "Accesorios", imagenUrl: null, agotado: false },
  { id: "boceto-6", nombre: "Tote Bag", precio: 12990, precioOferta: null, categoria: "Accesorios", imagenUrl: null, agotado: false },
  { id: "boceto-7", nombre: "Pack de Chapitas", precio: 7990, precioOferta: null, categoria: "Accesorios", imagenUrl: null, agotado: false },
  { id: "boceto-8", nombre: "Polera Logo Clásico", precio: 17990, precioOferta: null, categoria: "Poleras", imagenUrl: null, agotado: false },
];

export async function getProductos(): Promise<Producto[]> {
  const { data } = await supabase
    .from("productos")
    .select(
      "id, nombre, precio, precio_oferta, oferta_hasta, categoria, producto_imagenes(url, orden), variantes(stock)"
    )
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .order("orden", { foreignTable: "producto_imagenes", ascending: true });

  return (data ?? []).map((p) => {
    const variantes = p.variantes ?? [];
    return {
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      precioOferta: ofertaVigente(p.precio_oferta, p.oferta_hasta) ? p.precio_oferta : null,
      categoria: p.categoria,
      imagenUrl: p.producto_imagenes?.[0]?.url ?? null,
      agotado: variantes.length > 0 && variantes.every((v) => v.stock <= 0),
    };
  });
}

export async function getProducto(id: string): Promise<ProductoDetalle | null> {
  const { data } = await supabase
    .from("productos")
    .select(
      "id, nombre, descripcion, precio, precio_oferta, oferta_hasta, categoria, activo, alto_cm, ancho_cm, largo_cm, peso_kg, created_at"
    )
    .eq("id", id)
    .eq("activo", true)
    .single();

  return data ?? null;
}

export async function getVariantes(productoId: string): Promise<Variante[]> {
  const { data } = await supabase
    .from("variantes")
    .select("id, producto_id, talla, color, stock, created_at")
    .eq("producto_id", productoId);

  return data ?? [];
}

export async function getImagenesProducto(productoId: string): Promise<ProductoImagen[]> {
  const { data } = await supabase
    .from("producto_imagenes")
    .select("id, producto_id, url, orden, created_at")
    .eq("producto_id", productoId)
    .order("orden", { ascending: true });

  return data ?? [];
}
