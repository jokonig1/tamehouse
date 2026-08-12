"use client";

import { usePathname } from "next/navigation";

const RUTAS_OSCURAS = ["/musica", "/biografia", "/carrito"];
const RUTAS_CLARAS = ["/checkout"];

export default function Footer() {
  const pathname = usePathname();

  const esOscura =
    RUTAS_OSCURAS.includes(pathname) || pathname.startsWith("/producto/");
  const esClara = RUTAS_CLARAS.includes(pathname);

  const clases = esOscura
    ? "border-white/10 bg-black text-white/50"
    : esClara
      ? "border-black/[.08] bg-white text-zinc-600"
      : "border-black/[.08] bg-white text-zinc-600 dark:border-white/[.145] dark:bg-black dark:text-zinc-400";

  return (
    <footer className={`mt-auto border-t ${clases}`}>
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm">
        © {new Date().getFullYear()} Tamehouse. Todos los derechos reservados.
      </div>
    </footer>
  );
}
