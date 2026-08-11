import ProductGrid from "@/components/ProductGrid";
import { getProductos } from "@/lib/productos";

export default async function Page() {
  const productos = await getProductos();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tienda</h1>
      <div className="mt-6">
        <ProductGrid productos={productos} />
      </div>
    </div>
  );
}
