"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AdminHeaderProps {
  onAbrirMenu: () => void;
}

export default function AdminHeader({ onAbrirMenu }: AdminHeaderProps) {
  const router = useRouter();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="grid h-16 w-full grid-cols-3 items-center px-4 sm:h-20 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onAbrirMenu}
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/admin/pedidos" aria-label="Tamehouse" className="flex items-center">
            <Image
              src="/images/logolobo1.png"
              alt="Tamehouse"
              width={64}
              height={64}
              className="h-10 w-10 object-contain sm:h-16 sm:w-16"
              priority
            />
          </Link>
        </div>

        <span className="hidden justify-self-center text-base font-semibold uppercase tracking-wide text-white sm:block sm:text-lg">
          Panel de administración
        </span>

        <button
          type="button"
          onClick={cerrarSesion}
          className="justify-self-end text-[11px] font-medium uppercase tracking-widest text-white/70 hover:text-white sm:text-xs"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
