"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductoForm, { type ProductoFormValues } from "@/components/admin/ProductoForm";

export default function NuevoProductoPage() {
  const router = useRouter();

  async function crearProducto(valores: ProductoFormValues) {
    const { data, error } = await supabase
      .from("productos")
      .insert(valores)
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    router.push(`/admin/productos/${data.id}`);
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Nuevo producto</h1>
      <ProductoForm onGuardar={crearProducto} textoBoton="Crear producto" />
    </div>
  );
}
