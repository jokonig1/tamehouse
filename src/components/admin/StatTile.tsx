import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  value: string;
  delta?: { texto: string; esBueno: boolean } | null;
  alerta?: boolean;
  icono?: ReactNode;
  // Clases Tailwind bg-*, una por modo -- el fondo de la insignia del
  // ícono. Puramente identificativo (no es una métrica de estado), por
  // eso no se usa la paleta de status acá salvo cuando alerta=true.
  color?: string;
  // La métrica más importante del dashboard se destaca con fondo
  // oscuro -- "el número que lidera" (ver hero figure en la guía).
  destacado?: boolean;
};

export default function StatTile({
  label,
  value,
  delta,
  alerta,
  icono,
  color,
  destacado,
}: StatTileProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${
        destacado
          ? "bg-zinc-900 dark:bg-black"
          : "border border-black/8 dark:border-white/[.145]"
      }`}
    >
      {icono && (
        <div
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg ${
            destacado ? "bg-white/10 text-white" : `${color ?? "bg-black/5 dark:bg-white/10"} text-white`
          }`}
        >
          {icono}
        </div>
      )}

      <p
        className={`max-w-[70%] text-xs font-medium uppercase tracking-widest ${
          destacado ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold ${
          alerta
            ? "text-[#d03b3b] dark:text-[#e66767]"
            : destacado
            ? "text-white"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {delta && (
        <p
          className={`mt-1 text-xs font-medium ${
            delta.esBueno
              ? destacado
                ? "text-[#0ca30c]"
                : "text-[#006300] dark:text-[#0ca30c]"
              : "text-[#d03b3b] dark:text-[#e66767]"
          }`}
        >
          {delta.texto}
        </p>
      )}
    </div>
  );
}
