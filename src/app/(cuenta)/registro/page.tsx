"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [prefijo, setPrefijo] = useState("+569");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: `${nombre} ${apellido}`.trim(),
          telefono: `${prefijo} ${telefono}`.trim(),
        },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Ese correo ya tiene una cuenta."
          : "No pudimos crear la cuenta. Intentá de nuevo."
      );
      setCargando(false);
      return;
    }

    if (!data.session) {
      setMensaje("Te enviamos un correo para confirmar tu cuenta.");
      setCargando(false);
      return;
    }

    router.push("/mi-cuenta");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 py-12 text-black">
      <form onSubmit={manejarSubmit} className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Registrate para hacer seguimiento de tus pedidos.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {mensaje && <p className="mt-4 text-sm text-zinc-600">{mensaje}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              required
              placeholder="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex h-12 w-full items-center overflow-hidden rounded-md border border-black/15 bg-white focus-within:border-black/40">
            <input
              type="tel"
              required
              aria-label="Código de país"
              value={prefijo}
              onChange={(e) => setPrefijo(e.target.value)}
              className="h-full w-16 shrink-0 border-0 bg-transparent px-3 text-center text-sm text-zinc-400 outline-none"
            />
            <span className="h-5 w-px shrink-0 bg-black/10" />
            <input
              type="tel"
              required
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="h-full flex-1 border-0 bg-transparent px-3 text-sm text-black placeholder:text-black/40 outline-none"
            />
          </div>
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
            minLength={6}
            placeholder="Contraseña"
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
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-black underline">
            Ingresa
          </Link>
        </p>
      </form>
    </div>
  );
}
