"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconoDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function IconoPedidos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M6 7h12l1 13H5L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

function IconoProductos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M20.5 12.5 12 21l-9-9L11.5 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.5Z" />
      <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoDescuentos() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.2" />
      <circle cx="17" cy="17" r="2.2" />
    </svg>
  );
}

function IconoMusica() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

function IconoShows() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      <path d="M10 6v12" strokeDasharray="1.5 2" />
    </svg>
  );
}

function IconoPortada() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 15.5 16 11l-8.5 8.5" />
    </svg>
  );
}

const enlaces: { href: string; label: string; icono: ReactNode }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icono: <IconoDashboard /> },
  { href: "/admin/pedidos", label: "Pedidos", icono: <IconoPedidos /> },
  { href: "/admin/productos", label: "Productos", icono: <IconoProductos /> },
  { href: "/admin/descuentos", label: "Descuentos", icono: <IconoDescuentos /> },
  { href: "/admin/musica", label: "Música", icono: <IconoMusica /> },
  { href: "/admin/shows", label: "Shows", icono: <IconoShows /> },
  { href: "/admin/hero", label: "Portada", icono: <IconoPortada /> },
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
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium uppercase tracking-widest transition-colors ${
                    activo
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-600 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10"
                  }`}
                >
                  {enlace.icono}
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
