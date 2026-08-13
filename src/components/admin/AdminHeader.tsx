"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminHeader() {
  const router = useRouter();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="grid h-20 w-full grid-cols-3 items-center px-6">
        <Link href="/admin/productos" aria-label="Tamehouse" className="flex items-center">
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
        </Link>

        <span className="hidden justify-self-center text-lg font-semibold uppercase tracking-wide text-white sm:block">
          Panel de administración
        </span>

        <button
          type="button"
          onClick={cerrarSesion}
          className="justify-self-end text-xs font-medium uppercase tracking-widest text-white/70 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
