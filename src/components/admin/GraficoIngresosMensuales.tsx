type Punto = { mes: string; ingresos: number };

type GraficoIngresosMensualesProps = {
  datos: Punto[];
  formatoValor: (n: number) => string;
};

const W = 100;
const H = 36;
const PAD_TOP = 7;
const PAD_BOTTOM = 2;

// Línea + relleno suave para ingresos por mes -- "tendencia en el
// tiempo, una sola serie" pide justo esta forma (área al 10% de
// opacidad, nunca un bloque saturado). Se etiqueta solo el último
// punto (el mes actual): "líneas -> valor al final", el resto lo
// llevan el eje y el título al pasar el mouse.
export default function GraficoIngresosMensuales({
  datos,
  formatoValor,
}: GraficoIngresosMensualesProps) {
  if (datos.length === 0 || datos.every((d) => d.ingresos === 0)) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Sin pedidos todavía.</p>;
  }

  const max = Math.max(...datos.map((d) => d.ingresos), 1);
  const n = datos.length;
  const stepX = n > 1 ? W / (n - 1) : 0;

  const puntos = datos.map((d, i) => ({
    ...d,
    x: n > 1 ? i * stepX : W / 2,
    y: H - PAD_BOTTOM - (d.ingresos / max) * (H - PAD_TOP - PAD_BOTTOM),
  }));

  const linea = puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${linea} L${puntos[puntos.length - 1].x},${H - PAD_BOTTOM} L${puntos[0].x},${H - PAD_BOTTOM} Z`;
  const ultimo = puntos[puntos.length - 1];

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-40 w-full overflow-visible">
          <line
            x1={0}
            y1={H - PAD_BOTTOM}
            x2={W}
            y2={H - PAD_BOTTOM}
            className="stroke-[#e1e0d9] dark:stroke-[#2c2c2a]"
            strokeWidth={0.4}
            vectorEffect="non-scaling-stroke"
          />
          <path d={area} className="fill-[#2a78d6]/10 dark:fill-[#3987e5]/10" />
          <path
            d={linea}
            fill="none"
            className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
            strokeWidth={0.9}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {puntos.map((p) => (
            <circle
              key={p.mes}
              cx={p.x}
              cy={p.y}
              r={1.3}
              className="fill-[#2a78d6] stroke-white dark:fill-[#3987e5] dark:stroke-zinc-900"
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {p.mes}: {formatoValor(p.ingresos)}
              </title>
            </circle>
          ))}
        </svg>

        <span
          className="absolute -translate-x-1/2 -translate-y-full rounded-md bg-[#2a78d6] px-2 py-1 text-[11px] font-semibold text-white dark:bg-[#3987e5]"
          style={{ left: `${(ultimo.x / W) * 100}%`, top: `${(ultimo.y / H) * 100}%` }}
        >
          {formatoValor(ultimo.ingresos)}
        </span>
      </div>

      <div className="mt-2 flex">
        {datos.map((p) => (
          <span
            key={p.mes}
            className="flex-1 text-center text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            {p.mes}
          </span>
        ))}
      </div>
    </div>
  );
}
