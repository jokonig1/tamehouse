import Image from "next/image";

type ProductoVendido = {
  id: string;
  nombre: string;
  imagenUrl: string | null;
  vendidos: number;
};

type TopProductosProps = {
  items: ProductoVendido[];
  vacio?: string;
};

export default function TopProductos({ items, vacio }: TopProductosProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{vacio ?? "Sin datos."}</p>;
  }

  const max = Math.max(...items.map((i) => i.vendidos), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
            {item.imagenUrl && (
              <Image src={item.imagenUrl} alt={item.nombre} fill sizes="40px" className="object-cover" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {item.nombre}
            </p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/[.05] dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[#1baf7a] dark:bg-[#199e70]"
                style={{ width: `${Math.max(4, (item.vendidos / max) * 100)}%` }}
              />
            </div>
          </div>

          <span className="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {item.vendidos} vendidos
          </span>
        </li>
      ))}
    </ul>
  );
}
