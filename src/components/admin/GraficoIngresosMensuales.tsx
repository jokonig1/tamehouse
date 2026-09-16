type Punto = { mes: string; ingresos: number };

type GraficoIngresosMensualesProps = {
  datos: Punto[];
  formatoValor: (n: number) => string;
  color?: string;
};

const COLOR_DEFECTO = "bg-[#2a78d6] dark:bg-[#3987e5]";

// Columnas verticales para ingresos por mes -- magnitud a lo largo
// del tiempo, un solo hue secuencial. Etiqueta el valor sobre cada
// columna: con como mucho 6-12 meses en pantalla no es ruido, es la
// lectura directa del gráfico.
export default function GraficoIngresosMensuales({
  datos,
  formatoValor,
  color,
}: GraficoIngresosMensualesProps) {
  if (datos.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin pedidos todavía.</p>;
  }

  const max = Math.max(...datos.map((d) => d.ingresos), 1);

  return (
    <div className="flex h-48 items-end gap-3">
      {datos.map((punto) => (
        <div key={punto.mes} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
            {punto.ingresos > 0 ? formatoValor(punto.ingresos) : ""}
          </span>
          <div className="flex h-32 w-full items-end">
            <div
              className={`w-full rounded-t-sm ${color ?? COLOR_DEFECTO}`}
              style={{ height: `${Math.max(punto.ingresos > 0 ? 3 : 0, (punto.ingresos / max) * 100)}%` }}
              title={`${punto.mes}: ${formatoValor(punto.ingresos)}`}
            />
          </div>
          <span className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {punto.mes}
          </span>
        </div>
      ))}
    </div>
  );
}
