import { supabase } from "@/lib/supabase";
import type { Producto as ProductoDetalle, ProductoImagen, Variante } from "@/lib/types";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  categoria: string | null;
  imagenUrl: string | null;
};

export const PRODUCTOS_BOCETO: Producto[] = [
  { id: "boceto-1", nombre: "Polera Tour 2026", precio: 19990, categoria: "Poleras", imagenUrl: null },
  { id: "boceto-2", nombre: "Polerón Oversize", precio: 34990, categoria: "Poleras", imagenUrl: null },
  { id: "boceto-3", nombre: "Vinilo Edición Limitada", precio: 24990, categoria: "Vinilos", imagenUrl: null },
  { id: "boceto-4", nombre: "Gorro Bordado", precio: 14990, categoria: "Gorros", imagenUrl: null },
  { id: "boceto-5", nombre: "Poster de Gira", precio: 9990, categoria: "Accesorios", imagenUrl: null },
  { id: "boceto-6", nombre: "Tote Bag", precio: 12990, categoria: "Accesorios", imagenUrl: null },
  { id: "boceto-7", nombre: "Pack de Chapitas", precio: 7990, categoria: "Accesorios", imagenUrl: null },
  { id: "boceto-8", nombre: "Polera Logo Clásico", precio: 17990, categoria: "Poleras", imagenUrl: null },
];

export async function getProductos(): Promise<Producto[]> {
  const { data } = await supabase
    .from("productos")
    .select("id, nombre, precio, categoria, producto_imagenes(url, orden)")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .order("orden", { foreignTable: "producto_imagenes", ascending: true });

  return (data ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    categoria: p.categoria,
    imagenUrl: p.producto_imagenes?.[0]?.url ?? null,
  }));
}

export async function getProducto(id: string): Promise<ProductoDetalle | null> {
  const { data } = await supabase
    .from("productos")
    .select(
      "id, nombre, descripcion, precio, categoria, activo, alto_cm, ancho_cm, largo_cm, peso_kg, created_at"
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
