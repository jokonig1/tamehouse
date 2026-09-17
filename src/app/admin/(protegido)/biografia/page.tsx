"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BiografiaFaseRow from "@/components/admin/BiografiaFaseRow";
import BiografiaGaleriaRow from "@/components/admin/BiografiaGaleriaRow";
import { tarjetaClase } from "@/components/admin/ProductoForm";
import { subirImagenBiografia } from "@/lib/biografiaImagenes";
import type { BiografiaFase, BiografiaFoto } from "@/lib/biografia";

export default function BiografiaAdminPage() {
  const [fases, setFases] = useState<BiografiaFase[]>([]);
  const [cargandoFases, setCargandoFases] = useState(true);
  const [errorFases, setErrorFases] = useState<string | null>(null);
  const [agregandoFase, setAgregandoFase] = useState(false);

  const [galeria, setGaleria] = useState<BiografiaFoto[]>([]);
  const [cargandoGaleria, setCargandoGaleria] = useState(true);
  const [errorGaleria, setErrorGaleria] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const cargarFases = useCallback(async () => {
    setCargandoFases(true);
    const { data, error } = await supabase
      .from("biografia_fases")
      .select("id, year, titulo, texto, foto_url, orden")
      .order("orden", { ascending: true });

    if (error) {
      setErrorFases(error.message);
      setCargandoFases(false);
      return;
    }

    setFases(data ?? []);
    setCargandoFases(false);
  }, []);

  const cargarGaleria = useCallback(async () => {
    setCargandoGaleria(true);
    const { data, error } = await supabase
      .from("biografia_galeria")
      .select("id, url, orden")
      .order("orden", { ascending: true });

    if (error) {
      setErrorGaleria(error.message);
      setCargandoGaleria(false);
      return;
    }

    setGaleria(data ?? []);
    setCargandoGaleria(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarFases();
    cargarGaleria();
  }, [cargarFases, cargarGaleria]);

  async function agregarFase() {
    setErrorFases(null);
    setAgregandoFase(true);

    const ordenSiguiente = fases.length ? Math.max(...fases.map((f) => f.orden)) + 1 : 0;
    const { error } = await supabase.from("biografia_fases").insert({
      year: "",
      titulo: "Nueva era",
      texto: "",
      orden: ordenSiguiente,
    });

    setAgregandoFase(false);
    if (error) {
      setErrorFases(error.message);
      return;
    }

    await cargarFases();
  }

  function eliminarFase(id: string) {
    setFases((prev) => prev.filter((f) => f.id !== id));
  }

  async function moverFase(index: number, direccion: "arriba" | "abajo") {
    const otroIndex = direccion === "arriba" ? index - 1 : index + 1;
    if (otroIndex < 0 || otroIndex >= fases.length) return;

    const actual = fases[index];
    const otro = fases[otroIndex];

    const copia = [...fases];
    copia[index] = { ...otro, orden: actual.orden };
    copia[otroIndex] = { ...actual, orden: otro.orden };
    copia.sort((a, b) => a.orden - b.orden);
    setFases(copia);

    const { error } = await supabase
      .from("biografia_fases")
      .update({ orden: otro.orden })
      .eq("id", actual.id);
    const { error: errorOtro } = await supabase
      .from("biografia_fases")
      .update({ orden: actual.orden })
      .eq("id", otro.id);

    if (error || errorOtro) {
      alert(`No se pudo reordenar: ${(error ?? errorOtro)?.message}`);
      await cargarFases();
    }
  }

  async function agregarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setErrorGaleria(null);
    setSubiendoFoto(true);

    const { url, error: errorSubida } = await subirImagenBiografia(archivo);
    if (errorSubida || !url) {
      setErrorGaleria(errorSubida ?? "No se pudo subir la imagen.");
      setSubiendoFoto(false);
      return;
    }

    const ordenSiguiente = galeria.length ? Math.max(...galeria.map((f) => f.orden)) + 1 : 0;
    const { error: errorInsert } = await supabase
      .from("biografia_galeria")
      .insert({ url, orden: ordenSiguiente });

    setSubiendoFoto(false);
    if (errorInsert) {
      setErrorGaleria(errorInsert.message);
      return;
    }

    await cargarGaleria();
  }

  function eliminarFoto(id: string) {
    setGaleria((prev) => prev.filter((f) => f.id !== id));
  }

  async function moverFoto(index: number, direccion: "arriba" | "abajo") {
    const otroIndex = direccion === "arriba" ? index - 1 : index + 1;
    if (otroIndex < 0 || otroIndex >= galeria.length) return;

    const actual = galeria[index];
    const otro = galeria[otroIndex];

    const copia = [...galeria];
    copia[index] = { ...otro, orden: actual.orden };
    copia[otroIndex] = { ...actual, orden: otro.orden };
    copia.sort((a, b) => a.orden - b.orden);
    setGaleria(copia);

    const { error } = await supabase
      .from("biografia_galeria")
      .update({ orden: otro.orden })
      .eq("id", actual.id);
    const { error: errorOtro } = await supabase
      .from("biografia_galeria")
      .update({ orden: actual.orden })
      .eq("id", otro.id);

    if (error || errorOtro) {
      alert(`No se pudo reordenar: ${(error ?? errorOtro)?.message}`);
      await cargarGaleria();
    }
  }

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/pedidos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Biografía</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Biografía</h1>

      <div className={`${tarjetaClase} mb-6 space-y-2`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            Eras
          </h2>
          <button
            type="button"
            onClick={agregarFase}
            disabled={agregandoFase}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
          >
            {agregandoFase ? "Agregando..." : "Agregar era"}
          </button>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Cada era se muestra en la página pública alternando la foto de un lado y el texto del
          otro, en este orden.
        </p>
        {errorFases && <p className="text-sm text-red-600 dark:text-red-400">{errorFases}</p>}
      </div>

      {cargandoFases && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}

      {!cargandoFases && (
        <div className="mb-8 overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          {fases.length === 0 && (
            <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
              No hay eras agregadas todavía.
            </p>
          )}
          {fases.map((fase, index) => (
            <BiografiaFaseRow
              key={fase.id}
              fase={fase}
              esPrimero={index === 0}
              esUltimo={index === fases.length - 1}
              onEliminar={eliminarFase}
              onMover={(direccion) => moverFase(index, direccion)}
            />
          ))}
        </div>
      )}

      <div className={`${tarjetaClase} mb-6 space-y-3`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Galería
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Fotos que se muestran en la grilla al final de la página de biografía.
        </p>
        {errorGaleria && <p className="text-sm text-red-600 dark:text-red-400">{errorGaleria}</p>}
        <label className="inline-flex w-fit cursor-pointer items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80">
          {subiendoFoto ? "Subiendo..." : "Agregar foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={subiendoFoto}
            onChange={agregarFoto}
          />
        </label>
      </div>

      {cargandoGaleria && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}

      {!cargandoGaleria && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          {galeria.length === 0 && (
            <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
              No hay fotos en la galería todavía.
            </p>
          )}
          {galeria.map((foto, index) => (
            <BiografiaGaleriaRow
              key={foto.id}
              foto={foto}
              esPrimero={index === 0}
              esUltimo={index === galeria.length - 1}
              onEliminar={eliminarFoto}
              onMover={(direccion) => moverFoto(index, direccion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
