import type { Show } from "@/lib/shows";

const formatoFecha = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ShowList({
  shows,
  variant = "light",
}: {
  shows: Show[];
  variant?: "light" | "dark";
}) {
  if (shows.length === 0) {
    return (
      <p
        className={
          variant === "dark"
            ? "text-sm text-white/60"
            : "text-sm text-zinc-600 dark:text-zinc-400"
        }
      >
        Sin fechas por ahora.
      </p>
    );
  }

  return (
    <ul
      className={`divide-y ${
        variant === "dark"
          ? "divide-white/10"
          : "divide-black/[.08] dark:divide-white/[.145]"
      }`}
    >
      {shows.map((show) => (
        <li key={show.id} className="flex items-center justify-between py-4">
          <div>
            <p className={variant === "dark" ? "font-medium text-white" : "font-medium"}>
              {show.ciudad}
            </p>
            <p
              className={
                variant === "dark"
                  ? "text-sm text-white/60"
                  : "text-sm text-zinc-600 dark:text-zinc-400"
              }
            >
              {formatoFecha.format(new Date(show.fecha))}
              {show.lugar ? ` · ${show.lugar}` : ""}
            </p>
          </div>
          {show.link_entradas && (
            <a
              href={show.link_entradas}
              target="_blank"
              rel="noopener noreferrer"
              className={
                variant === "dark"
                  ? "text-sm font-medium text-white hover:opacity-70"
                  : "text-sm font-medium hover:opacity-70"
              }
            >
              Entradas
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
