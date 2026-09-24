"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { campoClaseRedondeado, etiquetaClaseFuerte, tarjetaClase } from "@/components/admin/ProductoForm";
import type { ConfiguracionMusica } from "@/lib/musica";

export default function MusicaPage() {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [cargandoEnlaces, setCargandoEnlaces] = useState(true);
  const [errorEnlaces, setErrorEnlaces] = useState<string | null>(null);
  const [guardandoEnlaces, setGuardandoEnlaces] = useState(false);
  const [enlacesGuardados, setEnlacesGuardados] = useState(false);

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
    cargarEnlaces();
  }, [cargarEnlaces]);

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

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/pedidos" className="hover:text-black dark:hover:text-white">
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
    </div>
  );
}
