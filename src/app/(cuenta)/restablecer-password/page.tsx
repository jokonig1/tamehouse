"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No pudimos actualizar la contraseña. El link puede haber expirado.");
      setCargando(false);
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 text-black">
      <form onSubmit={manejarSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-zinc-500">Elegí una nueva contraseña para tu cuenta.</p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={6}
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirmar contraseña"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
        >
          {cargando ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
