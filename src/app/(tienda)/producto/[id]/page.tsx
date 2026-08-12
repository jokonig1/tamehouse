import ProductoDetalle from "@/components/ProductoDetalle";
import { getProducto, getVariantes } from "@/lib/productos";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-black text-white">
        <p className="text-white/60">Producto no encontrado.</p>
      </div>
    );
  }

  const variantes = await getVariantes(producto.id);

  return (
    <div className="grid min-h-[calc(100vh-6rem)] w-full bg-black text-white lg:grid-cols-2">
      <div className="flex items-center justify-center border-b border-white/10 bg-white/5 p-16 lg:border-b-0 lg:border-r">
        <p className="text-sm text-white/40">Imagen próximamente</p>
      </div>

      <div className="flex items-center px-6 py-10 sm:px-12">
        <ProductoDetalle producto={producto} variantes={variantes} />
      </div>
    </div>
  );
}
