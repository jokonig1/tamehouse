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
    <nav className="w-56 shrink-0 border-r border-neutral-200 p-4">
      <p className="px-3 pb-4 text-sm font-semibold text-neutral-500">
        Panel admin
      </p>
      <ul className="space-y-1">
        {enlaces.map((enlace) => {
          const activo = pathname?.startsWith(enlace.href);
          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className={`block rounded px-3 py-2 text-sm ${
                  activo
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
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
