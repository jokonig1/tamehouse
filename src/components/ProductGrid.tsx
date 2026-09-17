import Image from "next/image";
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
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            {producto.agotado && (
              <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Sin stock
              </span>
            )}
            {!producto.agotado && producto.precioOferta !== null && (
              <span className="absolute left-2 top-2 z-10 rounded-md bg-black px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white dark:bg-white dark:text-black">
                Oferta
              </span>
            )}
            {producto.imagenUrl && (
              <Image
                src={producto.imagenUrl}
                alt={producto.nombre}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={`object-cover ${producto.agotado ? "opacity-60" : ""}`}
              />
            )}
          </div>
          <p className="mt-3 text-sm font-medium group-hover:opacity-70">
            {producto.nombre}
          </p>
          {producto.precioOferta !== null ? (
            <p className="flex items-baseline gap-1.5 text-sm">
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatoPrecio.format(producto.precioOferta)}
              </span>
              <span className="text-zinc-400 line-through dark:text-zinc-500">
                {formatoPrecio.format(producto.precio)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatoPrecio.format(producto.precio)}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
