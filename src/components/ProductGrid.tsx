import Link from "next/link";
import type { Producto } from "@/lib/productos";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export default function ProductGrid({
  productos,
  mensajeVacio = "Pronto disponible.",
}: {
  productos: Producto[];
  mensajeVacio?: string;
}) {
  if (productos.length === 0) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{mensajeVacio}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {productos.map((producto) => (
        <Link key={producto.id} href={`/producto/${producto.id}`} className="group">
          <div className="aspect-[3/4] rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <p className="mt-3 text-sm font-medium group-hover:opacity-70">
            {producto.nombre}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatoPrecio.format(producto.precio)}
          </p>
        </Link>
      ))}
    </div>
  );
}
