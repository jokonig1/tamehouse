type Item = { id: string; label: string; valor: number };

type BarraRankingProps = {
  items: Item[];
  formatoValor?: (n: number) => string;
  vacio?: string;
  // Clases Tailwind bg-*, una por modo. Cada tarjeta del dashboard usa
  // su propio color para distinguirse de un vistazo, pero adentro de
  // CADA gráfico sigue siendo un solo hue (secuencial) porque el
  // trabajo es "comparar tamaño", no "distinguir series".
  color?: string;
};

const COLOR_DEFECTO = "bg-[#2a78d6] dark:bg-[#3987e5]";

export default function BarraRanking({ items, formatoValor, vacio, color }: BarraRankingProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">{vacio ?? "Sin datos."}</p>;
  }

  const max = Math.max(...items.map((i) => i.valor), 1);
  const formatear = formatoValor ?? ((n: number) => n.toLocaleString("es-CL"));

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400" title={item.label}>
            {item.label}
          </span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-5 flex-1 overflow-hidden rounded-sm bg-black/[.04] dark:bg-white/[.06]">
              <div
                className={`h-full rounded-r-sm ${color ?? COLOR_DEFECTO}`}
                style={{ width: `${Math.max(4, (item.valor / max) * 100)}%` }}
                title={`${item.label}: ${formatear(item.valor)}`}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {formatear(item.valor)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
