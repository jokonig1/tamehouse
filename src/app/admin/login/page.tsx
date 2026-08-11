"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !data.user) {
      setError("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    if (perfil?.rol !== "admin") {
      await supabase.auth.signOut();
      setError("Esta cuenta no tiene permisos de administrador.");
      setCargando(false);
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={manejarSubmit} className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Panel de administración</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
