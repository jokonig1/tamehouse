"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeroSlideRow from "@/components/admin/HeroSlideRow";
import {
  campoClaseRedondeado,
  etiquetaClaseFuerte,
  tarjetaClase,
} from "@/components/admin/ProductoForm";
import { subirImagenHero } from "@/lib/heroImagenes";
import type { HeroSlide } from "@/lib/heroSlides";

export default function HeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [cargandoTextos, setCargandoTextos] = useState(true);
  const [errorTextos, setErrorTextos] = useState<string | null>(null);
  const [guardandoTextos, setGuardandoTextos] = useState(false);
  const [textosGuardados, setTextosGuardados] = useState(false);

  const cargarSlides = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("id, url, logo_oscuro, orden")
      .order("orden", { ascending: true });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setSlides(data ?? []);
    setCargando(false);
  }, []);

  const cargarTextos = useCallback(async () => {
    setCargandoTextos(true);
    const { data, error } = await supabase
      .from("configuracion_hero")
      .select("titulo, subtitulo")
      .eq("id", 1)
      .single();

    if (error) {
      setErrorTextos(error.message);
      setCargandoTextos(false);
      return;
    }

    setTitulo(data?.titulo ?? "");
    setSubtitulo(data?.subtitulo ?? "");
    setCargandoTextos(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarSlides();
    cargarTextos();
  }, [cargarSlides, cargarTextos]);

  async function guardarTextos(e: FormEvent) {
    e.preventDefault();
    setErrorTextos(null);
    setTextosGuardados(false);

    if (!titulo.trim() || !subtitulo.trim()) {
      setErrorTextos("El título y el subtítulo son obligatorios.");
      return;
    }

    setGuardandoTextos(true);
    const { error } = await supabase
      .from("configuracion_hero")
      .update({ titulo: titulo.trim(), subtitulo: subtitulo.trim() })
      .eq("id", 1);

    setGuardandoTextos(false);
    if (error) {
      setErrorTextos(error.message);
      return;
    }

    setTextosGuardados(true);
    setTimeout(() => setTextosGuardados(false), 3000);
  }

  async function agregarImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setError(null);
    setSubiendo(true);

    const { url, error: errorSubida } = await subirImagenHero(archivo);
    if (errorSubida || !url) {
      setError(errorSubida ?? "No se pudo subir la imagen.");
      setSubiendo(false);
      return;
    }

    const ordenSiguiente = slides.length
      ? Math.max(...slides.map((s) => s.orden)) + 1
      : 0;

    const { error: errorInsert } = await supabase
      .from("hero_slides")
      .insert({ url, orden: ordenSiguiente, logo_oscuro: false });

    setSubiendo(false);
    if (errorInsert) {
      setError(errorInsert.message);
      return;
    }

    await cargarSlides();
  }

  function eliminarSlide(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  }

  async function moverSlide(index: number, direccion: "arriba" | "abajo") {
    const otroIndex = direccion === "arriba" ? index - 1 : index + 1;
    if (otroIndex < 0 || otroIndex >= slides.length) return;

    const actual = slides[index];
    const otro = slides[otroIndex];

    const copia = [...slides];
    copia[index] = { ...otro, orden: actual.orden };
    copia[otroIndex] = { ...actual, orden: otro.orden };
    copia.sort((a, b) => a.orden - b.orden);
    setSlides(copia);

    const { error } = await supabase
      .from("hero_slides")
      .update({ orden: otro.orden })
      .eq("id", actual.id);

    const { error: errorOtro } = await supabase
      .from("hero_slides")
      .update({ orden: actual.orden })
      .eq("id", otro.id);

    if (error || errorOtro) {
      alert(`No se pudo reordenar: ${(error ?? errorOtro)?.message}`);
      await cargarSlides();
    }
  }

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Portada</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Portada</h1>

      <form onSubmit={guardarTextos} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Textos
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          El título y subtítulo que se muestran sobre las imágenes en la home.
        </p>

        {errorTextos && <p className="text-sm text-red-600 dark:text-red-400">{errorTextos}</p>}
        {textosGuardados && (
          <p className="text-sm text-green-600 dark:text-green-400">Guardado correctamente.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={etiquetaClaseFuerte}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={cargandoTextos}
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Subtítulo</label>
            <input
              type="text"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              disabled={cargandoTextos}
              className={campoClaseRedondeado}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={cargandoTextos || guardandoTextos}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
        >
          {guardandoTextos ? "Guardando..." : "Guardar textos"}
        </button>
      </form>

      <div className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Imágenes
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Con una sola imagen se muestra fija; con varias, rotan como carrusel en el orden de
          la lista. Activa &quot;Logo oscuro&quot; en las imágenes claras para que el logo del
          header se siga viendo bien encima.
        </p>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <label className="inline-flex w-fit cursor-pointer items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80">
          {subiendo ? "Subiendo..." : "Agregar imagen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={subiendo}
            onChange={agregarImagen}
          />
        </label>
      </div>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}

      {!cargando && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          {slides.length === 0 && (
            <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
              No hay imágenes agregadas todavía.
            </p>
          )}

          {slides.map((slide, index) => (
            <HeroSlideRow
              key={slide.id}
              slide={slide}
              esPrimero={index === 0}
              esUltimo={index === slides.length - 1}
              onEliminar={eliminarSlide}
              onMover={(direccion) => moverSlide(index, direccion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
