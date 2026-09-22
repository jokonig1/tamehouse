import ProductoDetalle from "@/components/ProductoDetalle";
import ProductoGaleria from "@/components/ProductoGaleria";
import VolverAtras from "@/components/VolverAtras";
import { getImagenesProducto, getProducto, getVariantes } from "@/lib/productos";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white text-black">
        <p className="text-zinc-500">Producto no encontrado.</p>
      </div>
    );
  }

  const [variantes, imagenes] = await Promise.all([
    getVariantes(producto.id),
    getImagenesProducto(producto.id),
  ]);

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-white text-black">
      <div className="px-6 pt-6 sm:px-12">
        <VolverAtras />
      </div>

      <div className="grid w-full lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <ProductoGaleria imagenes={imagenes} nombre={producto.nombre} />
        </div>

        <div className="flex items-start px-6 py-10 sm:px-12">
          <ProductoDetalle
            producto={producto}
            variantes={variantes}
            imagenUrl={imagenes[0]?.url ?? null}
          />
        </div>
      </div>
    </div>
  );
}
