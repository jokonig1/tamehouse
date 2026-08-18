"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const ENLACES = [
  { href: "/mi-cuenta", label: "Mi cuenta" },
  { href: "/mi-cuenta/pedidos", label: "Mis pedidos" },
];

export default function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      setCargando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUsuario(sesion?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (cargando) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-white text-black">
        <p className="text-zinc-500">Tenés que ingresar para ver tu cuenta.</p>
        <Link href="/login" className="text-sm font-medium underline hover:opacity-70">
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl flex-col gap-10 bg-white px-6 py-16 text-black sm:flex-row">
      <aside className="shrink-0 sm:w-48">
        <nav className="flex gap-1 sm:flex-col">
          {ENLACES.map((enlace) => {
            const activo = pathname === enlace.href;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activo ? "bg-black text-white" : "text-zinc-600 hover:bg-black/5"
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={cerrarSesion}
            className="mt-4 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-500 hover:bg-black/5 sm:mt-4"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
