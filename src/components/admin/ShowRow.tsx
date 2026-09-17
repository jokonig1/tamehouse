"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { campoClaseRedondeado, etiquetaClaseFuerte } from "@/components/admin/ProductoForm";
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
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancelar() {
    setFecha(show.fecha);
    setCiudad(show.ciudad);
    setLugar(show.lugar ?? "");
    setLinkEntradas(show.link_entradas ?? "");
    setError(null);
    setEditando(false);
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
    onEliminar(show.id);
  }

  if (editando) {
    return (
      <div className="space-y-4 border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

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

        <div className="flex gap-3">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
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
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_5rem] items-center gap-6 border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145]">
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
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Editar"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={eliminar}
          aria-label="Eliminar"
          className="hover:text-red-600 dark:hover:text-red-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={iconoClase}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            />
            <path strokeLinecap="round" d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
