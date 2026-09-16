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
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { logoOscuro } = useHero();
  const transparenteVisual = transparente && !menuAbierto;
  const modoOscuro = transparenteVisual && logoOscuro;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cierra el menú móvil al cambiar de ruta
    setMenuAbierto(false);
  }, [pathname]);

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

  function irATienda(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza el fondo del header con la ruta actual
      setTransparente(false);
      return;
    }

    function actualizar() {
      const sentinela = document.getElementById("fin-hero");
      if (!sentinela) {
        setTransparente(false);
        return;
      }
      setTransparente(sentinela.getBoundingClientRect().top > 140);
    }

    actualizar();
    window.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-20 transition-colors ${
        transparenteVisual ? "bg-transparent" : "bg-black"
      } ${modoOscuro ? "text-black" : "text-white"}`}
    >
      <div
        className={`grid h-20 w-full grid-cols-3 items-center px-6 transition-all sm:px-10 ${
          transparenteVisual ? "pt-3" : ""
        }`}
      >
        <div className="flex items-center justify-start">
          <button
            type="button"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
            className="flex h-6 w-6 items-center justify-center sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6"
            >
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          <nav
            className={`hidden gap-10 text-sm font-medium uppercase tracking-widest transition-all sm:flex ${
              transparenteVisual ? "-mt-3" : ""
            }`}
          >
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
        </div>

        <Link
          href="/"
          aria-label="Tamehouse"
          className="relative flex h-14 w-28 items-center justify-center justify-self-center"
          onClick={irAlInicio}
        >
          <Image
            src="/images/logooficial.png"
            alt="Tamehouse"
            width={1224}
            height={1285}
            className={`absolute left-1/2 top-1/2 h-28 w-auto -translate-x-1/2 -translate-y-[calc(50%-14px)] object-contain transition-opacity duration-500 ${
              transparenteVisual ? "opacity-100" : "opacity-0"
            }`}
            priority
          />
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={1024}
            height={1024}
            className={`absolute left-1/2 top-1/2 h-14 w-auto -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity duration-500 ${
              transparenteVisual ? "opacity-0" : "opacity-100"
            }`}
            priority
          />
        </Link>

        <div
          className={`flex items-center justify-end gap-8 transition-all ${
            transparenteVisual ? "-mt-3" : ""
          }`}
        >
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
          <Link
            href="/#tienda"
            aria-label="Buscar"
            onClick={pathname === "/" ? irATienda : undefined}
            className="hover:opacity-70 sm:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </Link>
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

      {menuAbierto && (
        <div className="absolute inset-x-0 top-full border-t border-white/10 bg-black text-white sm:hidden">
          <nav className="flex flex-col px-6 py-4 text-sm font-medium uppercase tracking-widest">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.href === "/" ? irAlInicio : undefined}
                className="border-b border-white/10 py-3 first:pt-0 last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            {conSesion ? (
              <>
                {esAdmin && (
                  <Link href="/admin/productos" className="border-b border-white/10 py-3">
                    Panel admin
                  </Link>
                )}
                <Link href="/mi-cuenta" className="border-b border-white/10 py-3">
                  Mi cuenta
                </Link>
                <Link href="/mi-cuenta/pedidos" className="border-b border-white/10 py-3">
                  Mis pedidos
                </Link>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="py-3 text-left last:border-b-0"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="py-3 last:border-b-0">
                Ingresa
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
