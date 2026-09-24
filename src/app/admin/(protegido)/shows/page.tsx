"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShowRow from "@/components/admin/ShowRow";
import { campoClaseRedondeado, etiquetaClaseFuerte, tarjetaClase } from "@/components/admin/ProductoForm";
import { eliminarImagenShow, subirImagenShow } from "@/lib/showsImagenes";
import type { Show } from "@/lib/shows";

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("Aerstame");
  const [fecha, setFecha] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [lugar, setLugar] = useState("");
  const [linkEntradas, setLinkEntradas] = useState("");
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarShows = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("shows")
      .select("id, fecha, ciudad, lugar, link_entradas, imagen_url, titulo")
      .order("fecha", { ascending: true });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setShows(data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarShows();
  }, [cargarShows]);

  async function subirAfiche(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setErrorForm(null);
    setSubiendoImagen(true);

    const { url, error: errorSubida } = await subirImagenShow(archivo);

    setSubiendoImagen(false);
    if (errorSubida || !url) {
      setErrorForm(errorSubida ?? "No se pudo subir el afiche.");
      return;
    }

    setImagenUrl(url);
  }

  async function quitarAfiche() {
    if (!imagenUrl) return;
    await eliminarImagenShow(imagenUrl);
    setImagenUrl(null);
  }

  async function agregarShow(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (!titulo.trim()) {
      setErrorForm("El título es obligatorio.");
      return;
    }
    if (!fecha) {
      setErrorForm("La fecha es obligatoria.");
      return;
    }
    if (!ciudad.trim()) {
      setErrorForm("La ciudad es obligatoria.");
      return;
    }
    if (linkEntradas.trim() && !/^https?:\/\//i.test(linkEntradas.trim())) {
      setErrorForm("El link de entradas debe empezar con http:// o https://");
      return;
    }

    setGuardando(true);
    const { error: errorInsert } = await supabase.from("shows").insert({
      titulo: titulo.trim(),
      fecha,
      ciudad: ciudad.trim(),
      lugar: lugar.trim() || null,
      link_entradas: linkEntradas.trim() || null,
      imagen_url: imagenUrl,
    });

    setGuardando(false);
    if (errorInsert) {
      setErrorForm(errorInsert.message);
      return;
    }

    setTitulo("Aerstame");
    setFecha("");
    setCiudad("");
    setLugar("");
    setLinkEntradas("");
    setImagenUrl(null);
    await cargarShows();
  }

  function eliminarShow(id: string) {
    setShows((prev) => prev.filter((s) => s.id !== id));
  }

  function actualizarShow(show: Show) {
    setShows((prev) =>
      prev.map((s) => (s.id === show.id ? show : s)).sort((a, b) => a.fecha.localeCompare(b.fecha))
    );
  }

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/pedidos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Shows</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Shows</h1>

      <form onSubmit={agregarShow} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Agregar show
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          El afiche (opcional) se muestra en la página pública de shows. Sin uno, se ve un
          reemplazo genérico con el nombre y la ciudad.
        </p>

        {errorForm && <p className="text-sm text-red-600 dark:text-red-400">{errorForm}</p>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[10rem_1fr]">
          <div>
            <label className={etiquetaClaseFuerte}>Afiche (opcional)</label>
            {imagenUrl ? (
              <div className="relative mt-1 aspect-3/4 w-40 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image src={imagenUrl} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={quitarAfiche}
                  aria-label="Quitar afiche"
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="mt-1 flex aspect-3/4 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-black/20 text-center text-xs text-zinc-500 hover:border-black/40 dark:border-white/20 dark:text-zinc-400 dark:hover:border-white/40">
                {subiendoImagen ? (
                  "Subiendo..."
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                    </svg>
                    Subir afiche
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={subiendoImagen}
                  onChange={subirAfiche}
                />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={etiquetaClaseFuerte}>Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Aerstame"
                className={campoClaseRedondeado}
              />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={campoClaseRedondeado}
              />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Ciudad</label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Santiago"
                className={campoClaseRedondeado}
              />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Lugar</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Movistar Arena"
                className={campoClaseRedondeado}
              />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Link de entradas</label>
              <input
                type="text"
                value={linkEntradas}
                onChange={(e) => setLinkEntradas(e.target.value)}
                placeholder="https://..."
                className={campoClaseRedondeado}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={guardando || subiendoImagen}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
        >
          {guardando ? "Agregando..." : "Agregar show"}
        </button>
      </form>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          <div className="hidden grid-cols-[4rem_1fr_1fr_1fr_1fr_5rem] gap-6 bg-zinc-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 sm:grid">
            <span></span>
            <span>Fecha</span>
            <span>Ciudad</span>
            <span>Lugar</span>
            <span>Entradas</span>
            <span></span>
          </div>

          {shows.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              No hay shows agregados todavía.
            </p>
          )}

          {shows.map((s) => (
            <ShowRow key={s.id} show={s} onEliminar={eliminarShow} onActualizado={actualizarShow} />
          ))}
        </div>
      )}
    </div>
  );
}
