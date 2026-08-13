"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Perfil = {
  nombre: string | null;
  telefono: string | null;
};

const inputClass =
  "h-11 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nombreEdit, setNombreEdit] = useState("");
  const [telefonoEdit, setTelefonoEdit] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [mensajePassword, setMensajePassword] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.auth.getUser();
      setUsuario(data.user);

      if (data.user) {
        const { data: perfilData } = await supabase
          .from("perfiles")
          .select("nombre, telefono")
          .eq("id", data.user.id)
          .single();
        setPerfil(perfilData);
        setNombreEdit(perfilData?.nombre ?? "");
        setTelefonoEdit(perfilData?.telefono ?? "");
      }

      setCargando(false);
    }

    cargar();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function guardarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setErrorPerfil(null);
    setGuardandoPerfil(true);

    const { error } = await supabase
      .from("perfiles")
      .update({ nombre: nombreEdit, telefono: telefonoEdit })
      .eq("id", usuario.id);

    if (error) {
      setErrorPerfil("No pudimos guardar los cambios.");
      setGuardandoPerfil(false);
      return;
    }

    setPerfil({ nombre: nombreEdit, telefono: telefonoEdit });
    setEditandoPerfil(false);
    setGuardandoPerfil(false);
  }

  async function cambiarPassword(e: FormEvent) {
    e.preventDefault();
    setErrorPassword(null);
    setMensajePassword(null);

    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaPassword.length < 6) {
      setErrorPassword("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setGuardandoPassword(true);
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword });

    if (error) {
      setErrorPassword("No pudimos actualizar la contraseña.");
      setGuardandoPassword(false);
      return;
    }

    setMensajePassword("Contraseña actualizada.");
    setNuevaPassword("");
    setConfirmarPassword("");
    setCambiandoPassword(false);
    setGuardandoPassword(false);
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
    <div className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-2xl bg-white px-6 py-16 text-black">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Mi cuenta</h1>
      <p className="mt-2 text-sm text-zinc-500">{usuario.email}</p>

      {/* Perfil */}
      <div className="mt-8 rounded-lg border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Perfil</h2>
          {!editandoPerfil && (
            <button
              type="button"
              onClick={() => setEditandoPerfil(true)}
              className="text-sm font-medium underline hover:opacity-70"
            >
              Editar
            </button>
          )}
        </div>

        {editandoPerfil ? (
          <form onSubmit={guardarPerfil} className="mt-4 flex flex-col gap-3">
            {errorPerfil && <p className="text-sm text-red-600">{errorPerfil}</p>}
            <input
              type="text"
              placeholder="Nombre"
              value={nombreEdit}
              onChange={(e) => setNombreEdit(e.target.value)}
              className={inputClass}
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefonoEdit}
              onChange={(e) => setTelefonoEdit(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={guardandoPerfil}
                className="flex h-10 flex-1 items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
              >
                {guardandoPerfil ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditandoPerfil(false);
                  setNombreEdit(perfil?.nombre ?? "");
                  setTelefonoEdit(perfil?.telefono ?? "");
                  setErrorPerfil(null);
                }}
                className="flex h-10 flex-1 items-center justify-center rounded-md border border-black/20 text-sm font-medium text-black hover:border-black/40"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3 flex flex-col gap-1 text-sm text-zinc-600">
            <p>{perfil?.nombre || "Sin nombre"}</p>
            <p>{perfil?.telefono || "Sin teléfono"}</p>
          </div>
        )}
      </div>

      {/* Seguridad */}
      <div className="mt-6 rounded-lg border border-black/10 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Seguridad</h2>
          {!cambiandoPassword && (
            <button
              type="button"
              onClick={() => setCambiandoPassword(true)}
              className="text-sm font-medium underline hover:opacity-70"
            >
              Cambiar contraseña
            </button>
          )}
        </div>

        {cambiandoPassword ? (
          <form onSubmit={cambiarPassword} className="mt-4 flex flex-col gap-3">
            {errorPassword && <p className="text-sm text-red-600">{errorPassword}</p>}
            <input
              type="password"
              required
              minLength={6}
              placeholder="Nueva contraseña"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className={inputClass}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={guardandoPassword}
                className="flex h-10 flex-1 items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50"
              >
                {guardandoPassword ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCambiandoPassword(false);
                  setNuevaPassword("");
                  setConfirmarPassword("");
                  setErrorPassword(null);
                }}
                className="flex h-10 flex-1 items-center justify-center rounded-md border border-black/20 text-sm font-medium text-black hover:border-black/40"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">
            {mensajePassword ?? "••••••••"}
          </p>
        )}
      </div>

      {/* Pedidos */}
      <div className="mt-6 rounded-lg border border-black/10 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Mis pedidos</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Próximamente vas a poder ver el estado de tus pedidos acá.
        </p>
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-8 text-sm font-medium underline hover:opacity-70"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
