"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductoRow from "@/components/admin/ProductoRow";
import type { ProductoListado } from "@/lib/types";

interface VarianteStock {
  stock: number;
}

interface ProductoConVariantes {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string | null;
  activo: boolean;
  variantes: VarianteStock[];
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, descripcion, precio, categoria, activo, variantes(stock)")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const productosConStock = (data ?? []) as unknown as ProductoConVariantes[];
    setProductos(
      productosConStock.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        categoria: p.categoria,
        activo: p.activo,
        stockTotal: p.variantes.reduce((acc, v) => acc + v.stock, 0),
      }))
    );
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarProductos();
  }, [cargarProductos]);

  async function eliminarProducto(id: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Nuevo producto
        </Link>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!cargando && !error && (
        <div className="border border-neutral-200">
          <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-2 bg-neutral-50 p-2 text-left text-xs font-medium text-neutral-500">
            <span></span>
            <span>Producto</span>
            <span>Categoría</span>
            <span>Precio</span>
            <span>Stock</span>
            <span></span>
          </div>

          {productos.length === 0 && (
            <p className="border-t border-neutral-200 p-4 text-sm text-neutral-500">
              No hay productos todavía.
            </p>
          )}

          {productos.map((p) => (
            <ProductoRow key={p.id} producto={p} onEliminar={eliminarProducto} />
          ))}
        </div>
      )}
    </div>
  );
}
