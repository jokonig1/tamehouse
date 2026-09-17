"use client";

import { supabase } from "@/lib/supabase";
import type { CodigoDescuento } from "@/lib/types";

interface CodigoDescuentoRowProps {
  codigo: CodigoDescuento;
  onEliminar: (id: string) => void;
  onActualizado: (codigo: CodigoDescuento) => void;
}

const formatoPrecio = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

function formatoFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString("es-CL");
}

export default function CodigoDescuentoRow({
  codigo,
  onEliminar,
  onActualizado,
}: CodigoDescuentoRowProps) {
  const vencido = codigo.vigente_hasta !== null && new Date(codigo.vigente_hasta) < new Date();
  const agotado = codigo.usos_maximos !== null && codigo.usos_actuales >= codigo.usos_maximos;

  async function alternarActivo() {
    const { error } = await supabase
      .from("codigos_descuento")
      .update({ activo: !codigo.activo })
      .eq("id", codigo.id);

    if (error) {
      alert(`No se pudo actualizar: ${error.message}`);
      return;
    }
    onActualizado({ ...codigo, activo: !codigo.activo });
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar el código ${codigo.codigo}?`)) return;
    const { error } = await supabase.from("codigos_descuento").delete().eq("id", codigo.id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    onEliminar(codigo.id);
  }

  const valorTexto = codigo.tipo === "porcentaje" ? `${codigo.valor}%` : formatoPrecio.format(codigo.valor);
  const vigenciaTexto = codigo.vigente_hasta ? formatoFecha(codigo.vigente_hasta) : "Sin vencimiento";

  return (
    <div className="border-t border-black/8 px-4 py-4 text-sm dark:border-white/[.145]">
      {/* Tarjeta apilada (mobile) -- nunca scroll horizontal */}
      <div className="flex flex-col gap-1.5 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono font-semibold">{codigo.codigo}</span>
          <BadgeEstado codigo={codigo} vencido={vencido} agotado={agotado} onClick={alternarActivo} />
        </div>
        <span className="text-zinc-600 dark:text-zinc-400">
          {valorTexto}
          {codigo.tope_maximo !== null && ` (tope ${formatoPrecio.format(codigo.tope_maximo)})`}
        </span>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {codigo.usos_actuales} / {codigo.usos_maximos ?? "∞"} usos · {vigenciaTexto}
          </span>
          <button
            type="button"
            onClick={eliminar}
            aria-label="Eliminar"
            className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <IconoEliminar />
          </button>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {codigo.permite_con_oferta ? "Con oferta: sí" : "Con oferta: no"}
        </span>
      </div>

      {/* Fila en columnas (sm y más) */}
      <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_1fr_6rem] items-center gap-4 sm:grid">
        <span className="font-mono font-semibold">{codigo.codigo}</span>
        <span>
          {valorTexto}
          {codigo.tope_maximo !== null && (
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              tope {formatoPrecio.format(codigo.tope_maximo)}
            </span>
          )}
        </span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {codigo.usos_actuales} / {codigo.usos_maximos ?? "∞"}
        </span>
        <span className="text-zinc-600 dark:text-zinc-400">{vigenciaTexto}</span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {codigo.permite_con_oferta ? "Con oferta: sí" : "Con oferta: no"}
        </span>

        <div className="flex items-center justify-end gap-3">
          <BadgeEstado codigo={codigo} vencido={vencido} agotado={agotado} onClick={alternarActivo} />
          <button
            type="button"
            onClick={eliminar}
            aria-label="Eliminar"
            className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
          >
            <IconoEliminar />
          </button>
        </div>
      </div>
    </div>
  );
}

function BadgeEstado({
  codigo,
  vencido,
  agotado,
  onClick,
}: {
  codigo: CodigoDescuento;
  vencido: boolean;
  agotado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-widest ${
        codigo.activo && !vencido && !agotado
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {codigo.activo ? (vencido ? "Vencido" : agotado ? "Agotado" : "Activo") : "Inactivo"}
    </button>
  );
}

function IconoEliminar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path strokeLinecap="round" d="M10 11v6M14 11v6" />
    </svg>
  );
}
