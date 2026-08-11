import Link from "next/link";
import type { Producto } from "@/lib/productos";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const PRODUCTOS_BOCETO: Producto[] = [
  { id: "boceto-1", nombre: "Polera Tour 2026", precio: 19990 },
  { id: "boceto-2", nombre: "Polerón Oversize", precio: 34990 },
  { id: "boceto-3", nombre: "Vinilo Edición Limitada", precio: 24990 },
  { id: "boceto-4", nombre: "Gorro Bordado", precio: 14990 },
  { id: "boceto-5", nombre: "Poster de Gira", precio: 9990 },
  { id: "boceto-6", nombre: "Tote Bag", precio: 12990 },
  { id: "boceto-7", nombre: "Pack de Chapitas", precio: 7990 },
  { id: "boceto-8", nombre: "Polera Logo Clásico", precio: 17990 },
];

export default function ProductGrid({ productos }: { productos: Producto[] }) {
  const items = productos.length > 0 ? productos : PRODUCTOS_BOCETO;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((producto) => (
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
