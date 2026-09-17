"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CodigoDescuentoRow from "@/components/admin/CodigoDescuentoRow";
import { campoClaseRedondeado, etiquetaClaseFuerte, tarjetaClase } from "@/components/admin/ProductoForm";
import type { CodigoDescuento } from "@/lib/types";

type Tipo = "porcentaje" | "monto_fijo";

export default function DescuentosPage() {
  const [codigos, setCodigos] = useState<CodigoDescuento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<Tipo>("porcentaje");
  const [valor, setValor] = useState("");
  const [permiteConOferta, setPermiteConOferta] = useState(false);
  const [montoMinimo, setMontoMinimo] = useState("");
  const [topeMaximo, setTopeMaximo] = useState("");
  const [usosMaximos, setUsosMaximos] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarCodigos = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("codigos_descuento")
      .select(
        "id, codigo, tipo, valor, permite_con_oferta, monto_minimo, tope_maximo, usos_maximos, usos_actuales, vigente_hasta, activo, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    setCodigos((data ?? []) as CodigoDescuento[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarCodigos();
  }, [cargarCodigos]);

  function limpiarForm() {
    setCodigo("");
    setTipo("porcentaje");
    setValor("");
    setPermiteConOferta(false);
    setMontoMinimo("");
    setTopeMaximo("");
    setUsosMaximos("");
    setVigenteHasta("");
  }

  async function crearCodigo(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (!codigo.trim()) {
      setErrorForm("El código es obligatorio.");
      return;
    }

    const valorNumero = Number(valor);
    if (!valor || Number.isNaN(valorNumero) || valorNumero <= 0) {
      setErrorForm("El valor debe ser un número mayor a 0.");
      return;
    }
    if (tipo === "porcentaje" && valorNumero > 100) {
      setErrorForm("Un porcentaje no puede ser mayor a 100.");
      return;
    }

    setGuardando(true);
    const { error: errorInsert } = await supabase.from("codigos_descuento").insert({
      codigo: codigo.trim().toUpperCase(),
      tipo,
      valor: valorNumero,
      permite_con_oferta: permiteConOferta,
      monto_minimo: montoMinimo ? Number(montoMinimo) : null,
      tope_maximo: topeMaximo ? Number(topeMaximo) : null,
      usos_maximos: usosMaximos ? Number(usosMaximos) : null,
      vigente_hasta: vigenteHasta ? new Date(vigenteHasta).toISOString() : null,
    });

    setGuardando(false);
    if (errorInsert) {
      setErrorForm(
        errorInsert.message.includes("duplicate")
          ? "Ya existe un código con ese nombre."
          : errorInsert.message
      );
      return;
    }

    limpiarForm();
    await cargarCodigos();
  }

  function eliminarCodigo(id: string) {
    setCodigos((prev) => prev.filter((c) => c.id !== id));
  }

  function actualizarCodigo(actualizado: CodigoDescuento) {
    setCodigos((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
  }

  return (
    <div>
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/pedidos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Descuentos</span>
      </nav>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Descuentos</h1>

      <form onSubmit={crearCodigo} className={`${tarjetaClase} mb-6 space-y-4`}>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
          Nuevo código
        </h2>

        {errorForm && <p className="text-sm text-red-600 dark:text-red-400">{errorForm}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={etiquetaClaseFuerte}>Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="VERANO20"
              className={`${campoClaseRedondeado} uppercase`}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              className={campoClaseRedondeado}
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto fijo (CLP)</option>
            </select>
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>
              Valor {tipo === "porcentaje" ? "(%)" : "(CLP)"}
            </label>
            <input
              type="number"
              min={1}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Compra mínima (opcional)</label>
            <input
              type="number"
              min={0}
              value={montoMinimo}
              onChange={(e) => setMontoMinimo(e.target.value)}
              placeholder="Sin mínimo"
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Tope máximo de descuento (opcional)</label>
            <input
              type="number"
              min={1}
              value={topeMaximo}
              onChange={(e) => setTopeMaximo(e.target.value)}
              placeholder="Sin tope"
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Usos máximos (opcional)</label>
            <input
              type="number"
              min={1}
              value={usosMaximos}
              onChange={(e) => setUsosMaximos(e.target.value)}
              placeholder="Sin límite"
              className={campoClaseRedondeado}
            />
          </div>
          <div>
            <label className={etiquetaClaseFuerte}>Vigente hasta (opcional)</label>
            <input
              type="date"
              value={vigenteHasta}
              onChange={(e) => setVigenteHasta(e.target.value)}
              className={campoClaseRedondeado}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={permiteConOferta}
            onChange={(e) => setPermiteConOferta(e.target.checked)}
          />
          Permitir junto a productos que ya están en oferta
        </label>
        <p className="!mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Si lo dejas sin marcar, el código se rechaza cuando el carrito tiene algún producto en
          oferta (evita descuento sobre descuento).
        </p>

        <button
          type="submit"
          disabled={guardando}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
        >
          {guardando ? "Creando..." : "Crear código"}
        </button>
      </form>

      {cargando && <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!cargando && !error && (
        <div className="overflow-hidden rounded-xl border border-black/8 dark:border-white/[.145]">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_6rem] gap-4 bg-zinc-50 px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span>Código</span>
            <span>Valor</span>
            <span>Usos</span>
            <span>Vigencia</span>
            <span>Con oferta</span>
            <span></span>
          </div>

          {codigos.length === 0 && (
            <p className="border-t border-black/8 p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
              No hay códigos creados todavía.
            </p>
          )}

          {codigos.map((c) => (
            <CodigoDescuentoRow
              key={c.id}
              codigo={c}
              onEliminar={eliminarCodigo}
              onActualizado={actualizarCodigo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
