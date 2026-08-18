"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useHero } from "@/lib/hero";

const NAV_LINKS = [
  { href: "/", label: "Tienda" },
  { href: "/musica", label: "Música" },
  { href: "/biografia", label: "Biografía" },
];

const LIMITE_NOMBRE = 14;

function truncarNombre(texto: string) {
  const primerNombre = texto.trim().split(/\s+/)[0] ?? texto;
  return primerNombre.length > LIMITE_NOMBRE
    ? `${primerNombre.slice(0, LIMITE_NOMBRE)}…`
    : primerNombre;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [transparente, setTransparente] = useState(false);
  const [conSesion, setConSesion] = useState(false);
  const [nombre, setNombre] = useState<string | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const { logoOscuro } = useHero();
  const modoOscuro = transparente && logoOscuro;

  useEffect(() => {
    async function cargarSesion(userId: string | undefined) {
      if (!userId) {
        setConSesion(false);
        setNombre(null);
        setEsAdmin(false);
        return;
      }
      setConSesion(true);
      const { data } = await supabase
        .from("perfiles")
        .select("nombre, rol")
        .eq("id", userId)
        .single();
      setNombre(data?.nombre ?? null);
      setEsAdmin(data?.rol === "admin");
    }

    supabase.auth.getUser().then(({ data }) => cargarSesion(data.user?.id));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      cargarSesion(sesion?.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function irAlInicio(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el fondo del header con la ruta actual
      setTransparente(false);
      return;
    }

    const sentinela = document.getElementById("fin-hero");
    if (!sentinela) {
      setTransparente(false);
      return;
    }

    setTransparente(true);
    const observer = new IntersectionObserver(([entry]) => {
      setTransparente(entry.boundingClientRect.top > 0);
    });
    observer.observe(sentinela);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-20 transition-colors ${
        transparente ? "bg-transparent" : "bg-black"
      } ${modoOscuro ? "text-black" : "text-white"}`}
    >
      <div
        className={`grid h-20 w-full grid-cols-3 items-center px-6 transition-all sm:px-10 ${
          transparente ? "pt-3" : ""
        }`}
      >
        <nav className="hidden justify-start gap-10 text-sm font-medium uppercase tracking-widest sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.href === "/" ? irAlInicio : undefined}
              className="hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          aria-label="Tamehouse"
          className="flex items-center justify-self-center"
          onClick={irAlInicio}
        >
          <Image
            src={modoOscuro ? "/images/tamehousenegro.png" : "/images/tamehouseblanco.png"}
            alt="Tamehouse"
            width={1536}
            height={1024}
            className={`object-contain transition-all ${
              transparente ? "h-20 w-auto" : "h-14 w-auto"
            }`}
            priority
          />
        </Link>

        <div className="flex items-center justify-end gap-8">
          {conSesion ? (
            <div className="group relative hidden sm:block">
              <Link
                href="/mi-cuenta"
                className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-widest hover:opacity-70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-7 w-7"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path strokeLinecap="round" d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                </svg>
                {truncarNombre(nombre || "Mi cuenta")}
              </Link>

              <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100">
                <div className="w-44 rounded-md border border-black/10 bg-white py-2 text-black shadow-lg">
                  {esAdmin && (
                    <Link
                      href="/admin/productos"
                      className="block px-4 py-2 text-sm hover:bg-black/5"
                    >
                      Panel admin
                    </Link>
                  )}
                  <Link href="/mi-cuenta" className="block px-4 py-2 text-sm hover:bg-black/5">
                    Mi cuenta
                  </Link>
                  <Link
                    href="/mi-cuenta/pedidos"
                    className="block px-4 py-2 text-sm hover:bg-black/5"
                  >
                    Mis pedidos
                  </Link>
                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-black/5"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center text-sm font-medium uppercase tracking-widest hover:opacity-70 sm:flex"
            >
              Ingresa
            </Link>
          )}
          <Link href="/carrito" aria-label="Carrito" className="hover:opacity-70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7V6a6 6 0 1 1 12 0v1M3.5 7h17l-1.2 13.2a2 2 0 0 1-2 1.8H6.7a2 2 0 0 1-2-1.8L3.5 7Z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
