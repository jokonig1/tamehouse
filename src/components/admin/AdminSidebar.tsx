"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/descuentos", label: "Descuentos" },
  { href: "/admin/musica", label: "Música" },
  { href: "/admin/hero", label: "Portada" },
];

interface AdminSidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function AdminSidebar({ abierto, onCerrar }: AdminSidebarProps) {
  const pathname = usePathname();

  // Cierra el cajón (mobile) solo cuando cambia de página -- en
  // desktop es estático y esto no hace nada visible.
  useEffect(() => {
    onCerrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar al cambio de ruta
  }, [pathname]);

  return (
    <>
      {abierto && (
        <div
          onClick={onCerrar}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[80vw] transform overflow-y-auto border-r border-black/8 bg-white px-4 py-8 transition-transform duration-200 ease-out dark:border-white/[.145] dark:bg-zinc-950 md:static md:z-auto md:w-56 md:max-w-none md:shrink-0 md:translate-x-0 md:bg-transparent md:transition-none md:dark:bg-transparent ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/"
          className="mb-6 block border-b border-black/8 px-2 pb-6 text-xs font-medium uppercase tracking-widest text-zinc-600 hover:opacity-70 dark:border-white/[.145] dark:text-zinc-400"
        >
          ← Volver a la tienda
        </Link>

        <ul className="space-y-1">
          {enlaces.map((enlace) => {
            const activo = pathname?.startsWith(enlace.href);
            return (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className={`block px-2 py-2 text-xs font-medium uppercase tracking-widest hover:opacity-70 ${
                    activo ? "" : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {enlace.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
