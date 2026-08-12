"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const campoClase =
  "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white " +
  "[&:-webkit-autofill]:[-webkit-text-fill-color:white] " +
  "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_rgba(255,255,255,0.08)_inset] " +
  "[&:-webkit-autofill]:[caret-color:white] " +
  "[&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s,color_9999s_ease-in-out_0s]";

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
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white scheme-dark">
      <form onSubmit={manejarSubmit} className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Panel de administración
          </h1>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-white/60">
              Correo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={campoClase}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-white/60">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={campoClase}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-white px-4 py-3 text-xs font-semibold uppercase tracking-widest text-black hover:opacity-80 disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
