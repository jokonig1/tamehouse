import { supabase } from "@/lib/supabase";

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
};

export async function getProductos(): Promise<Producto[]> {
  const { data } = await supabase
    .from("productos")
    .select("id, nombre, precio")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}
