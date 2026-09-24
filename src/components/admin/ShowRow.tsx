"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { campoClaseRedondeado, etiquetaClaseFuerte } from "@/components/admin/ProductoForm";
import { eliminarImagenShow, subirImagenShow } from "@/lib/showsImagenes";
import type { Show } from "@/lib/shows";

interface ShowRowProps {
  show: Show;
  onEliminar: (id: string) => void;
  onActualizado: (show: Show) => void;
}

const iconoClase = "h-4 w-4";

function formatoFecha(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default function ShowRow({ show, onEliminar, onActualizado }: ShowRowProps) {
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(show.fecha);
  const [ciudad, setCiudad] = useState(show.ciudad);
  const [lugar, setLugar] = useState(show.lugar ?? "");
  const [linkEntradas, setLinkEntradas] = useState(show.link_entradas ?? "");
  const [imagenUrl, setImagenUrl] = useState(show.imagen_url ?? null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancelar() {
    setFecha(show.fecha);
    setCiudad(show.ciudad);
    setLugar(show.lugar ?? "");
    setLinkEntradas(show.link_entradas ?? "");
    setImagenUrl(show.imagen_url ?? null);
    setError(null);
    setEditando(false);
  }

  async function subirAfiche(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setError(null);
    setSubiendoImagen(true);

    const { url, error: errorSubida } = await subirImagenShow(archivo);

    setSubiendoImagen(false);
    if (errorSubida || !url) {
      setError(errorSubida ?? "No se pudo subir el afiche.");
      return;
    }

    setImagenUrl(url);
  }

  async function quitarAfiche() {
    if (!imagenUrl) return;
    await eliminarImagenShow(imagenUrl);
    setImagenUrl(null);
  }

  async function guardar() {
    setError(null);

    if (!fecha) {
      setError("La fecha es obligatoria.");
      return;
    }
    if (!ciudad.trim()) {
      setError("La ciudad es obligatoria.");
      return;
    }
    if (linkEntradas.trim() && !/^https?:\/\//i.test(linkEntradas.trim())) {
      setError("El link de entradas debe empezar con http:// o https://");
      return;
    }

    setGuardando(true);

    const valores = {
      fecha,
      ciudad: ciudad.trim(),
      lugar: lugar.trim() || null,
      link_entradas: linkEntradas.trim() || null,
      imagen_url: imagenUrl,
    };

    const { error: errorGuardar } = await supabase.from("shows").update(valores).eq("id", show.id);

    setGuardando(false);
    if (errorGuardar) {
      setError(errorGuardar.message);
      return;
    }

    onActualizado({ id: show.id, ...valores });
    setEditando(false);
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este show?")) return;
    const { error: errorEliminar } = await supabase.from("shows").delete().eq("id", show.id);
    if (errorEliminar) {
      alert(`No se pudo eliminar: ${errorEliminar.message}`);
      return;
    }
    if (show.imagen_url) await eliminarImagenShow(show.imagen_url);
    onEliminar(show.id);
  }

  if (editando) {
    return (
      <div className="space-y-4 border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[8rem_1fr]">
          <div>
            <label className={etiquetaClaseFuerte}>Afiche</label>
            {imagenUrl ? (
              <div className="relative mt-1 aspect-3/4 w-32 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
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
              <label className="mt-1 flex aspect-3/4 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-black/20 text-center text-xs text-zinc-500 hover:border-black/40 dark:border-white/20 dark:text-zinc-400 dark:hover:border-white/40">
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
                className={campoClaseRedondeado}
              />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Lugar</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando || subiendoImagen}
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={cancelar}
            disabled={guardando}
            className="rounded-full border border-black/8 px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:opacity-70 disabled:opacity-50 dark:border-white/[.145]"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145]">
      {/* Tarjeta apilada (mobile) -- nunca scroll horizontal */}
      <div className="flex gap-3 sm:hidden">
        <MiniAfiche url={show.imagen_url} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{formatoFecha(show.fecha)} · {show.ciudad}</span>
            <AccionesShow onEditar={() => setEditando(true)} onEliminar={eliminar} />
          </div>
          <span className="text-zinc-600 dark:text-zinc-400">{show.lugar ?? "-"}</span>
          {show.link_entradas ? (
            <a
              href={show.link_entradas}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Ver entradas
            </a>
          ) : (
            <span className="text-zinc-400">-</span>
          )}
        </div>
      </div>

      {/* Fila en columnas (sm y más) */}
      <div className="hidden grid-cols-[4rem_1fr_1fr_1fr_1fr_5rem] items-center gap-6 sm:grid">
        <MiniAfiche url={show.imagen_url} />
        <span className="font-medium">{formatoFecha(show.fecha)}</span>
        <span>{show.ciudad}</span>
        <span className="text-zinc-600 dark:text-zinc-400">{show.lugar ?? "-"}</span>
        {show.link_entradas ? (
          <a
            href={show.link_entradas}
            target="_blank"
            rel="noreferrer"
            className="truncate text-blue-600 hover:underline dark:text-blue-400"
          >
            Ver entradas
          </a>
        ) : (
          <span className="text-zinc-400">-</span>
        )}

        <div className="flex items-center justify-end gap-3 text-zinc-500 dark:text-zinc-400">
          <AccionesShow onEditar={() => setEditando(true)} onEliminar={eliminar} />
        </div>
      </div>
    </div>
  );
}

function MiniAfiche({ url }: { url: string | null | undefined }) {
  return (
    <div className="relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
      {url ? (
        <Image src={url} alt="" fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9px] font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Sin foto
        </div>
      )}
    </div>
  );
}

function AccionesShow({ onEditar, onEliminar }: { onEditar: () => void; onEliminar: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-3 text-zinc-500 dark:text-zinc-400">
      <button type="button" onClick={onEditar} aria-label="Editar" className="hover:text-blue-600 dark:hover:text-blue-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
          />
        </svg>
      </button>

      <button type="button" onClick={onEliminar} aria-label="Eliminar" className="hover:text-red-600 dark:hover:text-red-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path strokeLinecap="round" d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </div>
  );
}
