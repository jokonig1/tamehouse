"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductoForm, { type ProductoFormValues } from "@/components/admin/ProductoForm";
import type { Producto } from "@/lib/types";

export default function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProducto = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select(
        "id, nombre, descripcion, precio, categoria, activo, alto_cm, ancho_cm, largo_cm, peso_kg, created_at"
      )
      .eq("id", id)
      .single();

    if (error) setError(error.message);
    else setProducto(data);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarProducto();
  }, [cargarProducto]);

  async function actualizarProducto(valores: ProductoFormValues) {
    const { error } = await supabase.from("productos").update(valores).eq("id", id);
    if (error) throw new Error(error.message);
    await cargarProducto();
  }

  async function eliminarProducto() {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    router.push("/admin/productos");
  }

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!producto) return <p>Producto no encontrado.</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Editar producto</h1>
      <ProductoForm
        valoresIniciales={producto}
        onGuardar={actualizarProducto}
        textoBoton="Guardar cambios"
      />
      <button onClick={eliminarProducto} className="mt-4 text-sm text-red-600 hover:underline">
        Eliminar producto
      </button>
    </div>
  );
}
