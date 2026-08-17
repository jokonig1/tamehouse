"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [errorRecuperar, setErrorRecuperar] = useState<string | null>(null);
  const [mensajeRecuperar, setMensajeRecuperar] = useState<string | null>(null);
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);

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

    router.push(perfil?.rol === "admin" ? "/admin/productos" : "/mi-cuenta");
    router.refresh();
  }

  async function manejarRecuperar(e: FormEvent) {
    e.preventDefault();
    setErrorRecuperar(null);
    setMensajeRecuperar(null);
    setEnviandoRecuperar(true);

    const { error: recuperarError } = await supabase.auth.resetPasswordForEmail(
      emailRecuperar,
      { redirectTo: `${window.location.origin}/restablecer-password` }
    );

    if (recuperarError) {
      setErrorRecuperar("No pudimos enviar el correo. Intentá de nuevo.");
      setEnviandoRecuperar(false);
      return;
    }

    setMensajeRecuperar("Te enviamos un correo con instrucciones para restablecer tu contraseña.");
    setEnviandoRecuperar(false);
  }

  if (modoRecuperar) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 text-black">
        <form onSubmit={manejarRecuperar} className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Ingresá tu correo y te mandamos instrucciones para restablecerla.
          </p>

          {errorRecuperar && <p className="mt-4 text-sm text-red-600">{errorRecuperar}</p>}
          {mensajeRecuperar && (
            <p className="mt-4 text-sm text-zinc-600">{mensajeRecuperar}</p>
          )}

          <div className="mt-6">
            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={emailRecuperar}
              onChange={(e) => setEmailRecuperar(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={enviandoRecuperar}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
          >
            {enviandoRecuperar ? "Enviando..." : "Enviar instrucciones"}
          </button>

          <button
            type="button"
            onClick={() => setModoRecuperar(false)}
            className="mt-6 block w-full text-center text-sm font-medium text-zinc-500 hover:text-black"
          >
            ‹ Volver a ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 text-black">
      <form onSubmit={manejarSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Ingresa</h1>
        <p className="mt-2 text-sm text-zinc-500">Accedé a tu cuenta para ver tus pedidos.</p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <button
          type="button"
          onClick={() => setModoRecuperar(true)}
          className="mt-3 text-sm font-medium text-zinc-500 hover:text-black"
        >
          ¿Olvidaste tu contraseña?
        </button>

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-medium text-black underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
