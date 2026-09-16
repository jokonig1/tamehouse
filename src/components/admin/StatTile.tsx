type StatTileProps = {
  label: string;
  value: string;
  delta?: { texto: string; esBueno: boolean } | null;
  alerta?: boolean;
};

export default function StatTile({ label, value, delta, alerta }: StatTileProps) {
  return (
    <div className="rounded-xl border border-black/8 p-4 dark:border-white/[.145]">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold ${
          alerta ? "text-[#d03b3b] dark:text-[#e66767]" : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {delta && (
        <p
          className={`mt-1 text-xs font-medium ${
            delta.esBueno
              ? "text-[#006300] dark:text-[#0ca30c]"
              : "text-[#d03b3b] dark:text-[#e66767]"
          }`}
        >
          {delta.texto}
        </p>
      )}
    </div>
  );
}
