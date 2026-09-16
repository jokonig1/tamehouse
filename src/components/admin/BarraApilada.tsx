type Segmento = { id: string; label: string; valor: number; color: string };

type BarraApiladaProps = {
  segmentos: Segmento[];
};

// Barra apilada horizontal para parte-del-todo con pocas categorías
// (envío vs retiro). Colores categóricos (identidad), con leyenda
// siempre presente porque son 2+ series -- nunca solo color.
export default function BarraApilada({ segmentos }: BarraApiladaProps) {
  const total = segmentos.reduce((suma, s) => suma + s.valor, 0);

  if (total === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin datos.</p>;
  }

  return (
    <div>
      <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-sm">
        {segmentos
          .filter((s) => s.valor > 0)
          .map((s) => (
            <div
              key={s.id}
              className={`h-full ${s.color}`}
              style={{ width: `${(s.valor / total) * 100}%` }}
              title={`${s.label}: ${s.valor}`}
            />
          ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segmentos.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${s.color}`} aria-hidden="true" />
            {s.label} — {s.valor} ({total > 0 ? Math.round((s.valor / total) * 100) : 0}%)
          </li>
        ))}
      </ul>
    </div>
  );
}
