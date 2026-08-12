"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/shows", label: "Shows" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-black/8 px-4 py-8 dark:border-white/[.145]">
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
  );
}
