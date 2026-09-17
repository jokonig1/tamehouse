"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShowRow from "@/components/admin/ShowRow";
import { campoClaseRedondeado, etiquetaClaseFuerte, tarjetaClase } from "@/components/admin/ProductoForm";
import type { ConfiguracionMusica } from "@/lib/musica";
import type { Show } from "@/lib/shows";

export default function MusicaPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fecha, setFecha] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [lugar, setLugar] = useState("");
  const [linkEntradas, setLinkEntradas] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [cargandoEnlaces, setCargandoEnlaces] = useState(true);
  const [errorEnlaces, setErrorEnlaces] = useState<string | null>(null);
  const [guardandoEnlaces, setGuardandoEnlaces] = useState(false);
  const [enlacesGuardados, setEnlacesGuardados] = useState(false);

  const cargarShows = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("shows")
      .select("id, fecha, ciudad, lugar, link_entradas")
      .order("fecha", { ascending: true });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setShows(data ?? []);
    setCargando(false);
  }, []);

  const cargarEnlaces = useCallback(async () => {
    setCargandoEnlaces(true);
    const { data, error } = await supabase
      .from("configuracion_musica")
      .select("spotify_url, youtube_url")
      .eq("id", 1)
      .single();

    if (error) {
      setErrorEnlaces(error.message);
      setCargandoEnlaces(false);
      return;
    }

    const config = data as ConfiguracionMusica;
    setSpotifyUrl(config.spotify_url ?? "");
    setYoutubeUrl(config.youtube_url ?? "");
    setCargandoEnlaces(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarShows();
    cargarEnlaces();
  }, [cargarShows, cargarEnlaces]);

  async function guardarEnlaces(e: FormEvent) {
    e.preventDefault();
    setErrorEnlaces(null);
    setEnlacesGuardados(false);

    if (spotifyUrl.trim() && !/^https?:\/\//i.test(spotifyUrl.trim())) {
      setErrorEnlaces("El link de Spotify debe empezar con http:// o https://");
      return;
    }
    if (youtubeUrl.trim() && !/^https?:\/\//i.test(youtubeUrl.trim())) {
      setErrorEnlaces("El link de YouTube debe empezar con http:// o https://");
      return;
    }

    setGuardandoEnlaces(true);
    const { error: errorUpdate } = await supabase
      .from("configuracion_musica")
      .update({
        spotify_url: spotifyUrl.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
      })
      .eq("id", 1);

    setGuardandoEnlaces(false);
    if (errorUpdate) {
      setErrorEnlaces(errorUpdate.message);
      return;
    }

    setEnlacesGuardados(true);
    setTimeout(() => setEnlacesGuardados(false), 3000);
  }

  async function agregarShow(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

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
      fecha,
      ciudad: ciudad.trim(),
      lugar: lugar.trim() || null,
      link_entradas: linkEntradas.trim() || null,
    });

    setGuardando(false);
    if (errorInsert) {
      setErrorForm(errorInsert.message);
      return;
    }

    setFecha("");
    setCiudad("");
    setLugar("");
    setLinkEntradas("");
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
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Música</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Música</h1>

      <form onSubmit={guardarEnlaces} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Enlaces
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Se muestran en la página pública de música (Escuchar en Spotify / Último video oficial).
        </p>

        {errorEnlaces && <p className="text-sm text-red-600 dark:text-red-400">{errorEnlaces}</p>}
        {enlacesGuardados && (
          <p className="text-sm text-green-600 dark:text-green-400">Guardado correctamente.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiquetaClaseFuerte}>Link de Spotify</label>
            <input
              type="text"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/..."
              disabled={cargandoEnlaces}
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Link de YouTube</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={cargandoEnlaces}
              className={campoClaseRedondeado}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargandoEnlaces || guardandoEnlaces}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
        >
          {guardandoEnlaces ? "Guardando..." : "Guardar enlaces"}
        </button>
      </form>

      <form onSubmit={agregarShow} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Agregar show
        </h2>

        {errorForm && <p className="text-sm text-red-600 dark:text-red-400">{errorForm}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        <button
          type="submit"
          disabled={guardando}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
        >
          {guardando ? "Agregando..." : "Agregar show"}
        </button>
      </form>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_5rem] gap-6 bg-zinc-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
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
