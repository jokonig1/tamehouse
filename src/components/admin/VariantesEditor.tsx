"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MedidasPorTalla from "@/components/admin/MedidasPorTalla";
import PrecioInput from "@/components/admin/PrecioInput";
import TallaGrid from "@/components/admin/TallaGrid";
import { limpiarMedidas } from "@/components/admin/ProductoForm";
import type { FilaTalla, Variante } from "@/lib/types";

const FILA_VACIA: FilaTalla = { id: null, talla: "", stock: "0", medidas: [] };

function aFilas(variantes: Variante[]): FilaTalla[] {
  return variantes.map((v) => ({
    id: v.id,
    talla: v.talla ?? "",
    stock: String(v.stock),
    medidas: v.medidas ?? [],
  }));
}

type TipoOferta = "porcentaje" | "monto_fijo";

interface VariantesEditorProps {
  productoId: string;
  precioInicial: number;
  onPrecioGuardado: (nuevoPrecio: number) => void;
  precioOfertaInicial: number | null;
  ofertaHastaInicial: string | null;
  ofertaTipoInicial: TipoOferta | null;
  ofertaValorInicial: number | null;
  onOfertaGuardada: (
    precioOferta: number | null,
    ofertaHasta: string | null,
    ofertaTipo: TipoOferta | null,
    ofertaValor: number | null
  ) => void;
}

function calcularPrecioOferta(precio: number, tipo: TipoOferta, valor: number) {
  if (!valor || valor <= 0) return null;
  return tipo === "porcentaje" ? Math.round(precio * (1 - valor / 100)) : precio - valor;
}

export default function VariantesEditor({
  productoId,
  precioInicial,
  onPrecioGuardado,
  precioOfertaInicial,
  ofertaHastaInicial,
  ofertaTipoInicial,
  ofertaValorInicial,
  onOfertaGuardada,
}: VariantesEditorProps) {
  const [filas, setFilas] = useState<FilaTalla[]>([]);
  const [modoAvanzado, setModoAvanzado] = useState(false);
  const [precio, setPrecio] = useState(String(precioInicial));
  const [tipoOferta, setTipoOferta] = useState<TipoOferta>(ofertaTipoInicial ?? "monto_fijo");
  const [valorOferta, setValorOferta] = useState(
    ofertaValorInicial !== null
      ? String(ofertaValorInicial)
      : precioOfertaInicial !== null
        ? String(precioInicial - precioOfertaInicial)
        : ""
  );
  const [ofertaHasta, setOfertaHasta] = useState(
    ofertaHastaInicial ? ofertaHastaInicial.slice(0, 10) : ""
  );
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVariantes = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("variantes")
      .select("id, producto_id, talla, color, stock, medidas, created_at")
      .eq("producto_id", productoId)
      .order("talla", { ascending: true });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    const filasCargadas = aFilas(data ?? []);
    const yaUsaTalla = filasCargadas.some((f) => f.talla !== "");

    setFilas(filasCargadas.length > 0 ? filasCargadas : [FILA_VACIA]);
    setModoAvanzado(yaUsaTalla);
    setCargando(false);
  }, [productoId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarVariantes();
  }, [cargarVariantes]);

  function actualizarFila(index: number, cambios: Partial<FilaTalla>) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  }

  function agregarTalla() {
    setFilas((prev) => [...prev, { id: null, talla: "", stock: "0", medidas: [] }]);
  }

  async function eliminarFila(index: number) {
    const fila = filas[index];
    if (fila.id) {
      if (!confirm("¿Eliminar esta talla?")) return;
      const { error } = await supabase.from("variantes").delete().eq("id", fila.id);
      if (error) {
        alert(`No se pudo eliminar: ${error.message}`);
        return;
      }
    }
    setFilas((prev) => {
      const restante = prev.filter((_, i) => i !== index);
      return restante.length > 0 ? restante : [FILA_VACIA];
    });
  }

  function cancelar() {
    setError(null);
    setPrecio(String(precioInicial));
    setTipoOferta(ofertaTipoInicial ?? "monto_fijo");
    setValorOferta(
      ofertaValorInicial !== null
        ? String(ofertaValorInicial)
        : precioOfertaInicial !== null
          ? String(precioInicial - precioOfertaInicial)
          : ""
    );
    setOfertaHasta(ofertaHastaInicial ? ofertaHastaInicial.slice(0, 10) : "");
    cargarVariantes();
  }

  async function guardarCambios() {
    setError(null);

    const precioNumero = Number(precio);
    if (!precio || Number.isNaN(precioNumero) || precioNumero <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }

    const valorOfertaNumero = Number(valorOferta);
    if (valorOferta && (Number.isNaN(valorOfertaNumero) || valorOfertaNumero <= 0)) {
      setError("El descuento de la oferta debe ser un número mayor a 0.");
      return;
    }
    if (tipoOferta === "porcentaje" && valorOfertaNumero > 100) {
      setError("El porcentaje de descuento no puede ser mayor a 100.");
      return;
    }

    const precioOfertaNuevo = valorOferta
      ? calcularPrecioOferta(precioNumero, tipoOferta, valorOfertaNumero)
      : null;

    if (precioOfertaNuevo !== null && precioOfertaNuevo <= 0) {
      setError("Ese descuento deja el precio en oferta en $0 o menos.");
      return;
    }
    if (precioOfertaNuevo !== null && precioOfertaNuevo >= precioNumero) {
      setError("El precio en oferta debe quedar por debajo del precio original.");
      return;
    }

    for (const fila of filas) {
      const stockNumero = Number(fila.stock);
      if (fila.stock.trim() === "" || Number.isNaN(stockNumero) || stockNumero < 0) {
        setError("El stock debe ser un número válido (0 o más).");
        return;
      }
    }

    setGuardando(true);

    const ofertaHastaIso =
      precioOfertaNuevo !== null && ofertaHasta ? new Date(ofertaHasta).toISOString() : null;
    const ofertaTipoNuevo = precioOfertaNuevo !== null ? tipoOferta : null;
    const ofertaValorNuevo = precioOfertaNuevo !== null ? valorOfertaNumero : null;
    const huboCambioDePrecio =
      precioNumero !== precioInicial ||
      precioOfertaNuevo !== precioOfertaInicial ||
      ofertaHastaIso !== ofertaHastaInicial ||
      ofertaTipoNuevo !== ofertaTipoInicial ||
      ofertaValorNuevo !== ofertaValorInicial;

    if (huboCambioDePrecio) {
      const { error: errorPrecio } = await supabase
        .from("productos")
        .update({
          precio: precioNumero,
          precio_oferta: precioOfertaNuevo,
          oferta_hasta: ofertaHastaIso,
          oferta_tipo: ofertaTipoNuevo,
          oferta_valor: ofertaValorNuevo,
        })
        .eq("id", productoId);

      if (errorPrecio) {
        setError(errorPrecio.message);
        setGuardando(false);
        return;
      }
      onOfertaGuardada(precioOfertaNuevo, ofertaHastaIso, ofertaTipoNuevo, ofertaValorNuevo);
    }

    const nuevas = filas
      .filter((f) => f.id === null)
      .map((f) => ({
        producto_id: productoId,
        talla: f.talla.trim() || null,
        color: null,
        stock: Number(f.stock),
        medidas: limpiarMedidas(f.medidas),
      }));

    if (nuevas.length) {
      const { error: errorInsert } = await supabase.from("variantes").insert(nuevas);
      if (errorInsert) {
        setError(errorInsert.message);
        setGuardando(false);
        return;
      }
    }

    const existentes = filas.filter((f) => f.id !== null);

    for (const f of existentes) {
      const { error: errorUpdate } = await supabase
        .from("variantes")
        .update({
          talla: f.talla.trim() || null,
          stock: Number(f.stock),
          medidas: limpiarMedidas(f.medidas),
        })
        .eq("id", f.id as string);

      if (errorUpdate) {
        setError(errorUpdate.message);
        setGuardando(false);
        return;
      }
    }

    onPrecioGuardado(precioNumero);
    await cargarVariantes();
    setGuardando(false);
  }

  if (cargando)
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando variantes...</p>;

  const modoSimple = !modoAvanzado && filas.length === 1 && filas[0].talla === "";
  const precioOfertaVista = valorOferta
    ? calcularPrecioOferta(Number(precio) || 0, tipoOferta, Number(valorOferta) || 0)
    : null;

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        {modoSimple ? (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Stock
            </h3>
            <input
              type="number"
              min={0}
              value={filas[0].stock}
              onChange={(e) => actualizarFila(0, { stock: e.target.value })}
              className="w-24 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
            />
            <button
              type="button"
              onClick={() => setModoAvanzado(true)}
              className="mt-3 block text-xs font-medium uppercase tracking-widest hover:opacity-70"
            >
              + Vender por talla
            </button>
          </div>
        ) : (
          <TallaGrid
            filas={filas}
            onActualizarFila={actualizarFila}
            onAgregarTalla={agregarTalla}
            onEliminarFila={eliminarFila}
          />
        )}

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            Precio original
          </h3>
          <PrecioInput
            value={precio}
            onChange={setPrecio}
            className="w-32 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
          />

          <h3 className="mt-4 mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            Oferta (opcional)
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={tipoOferta}
              onChange={(e) => setTipoOferta(e.target.value as TipoOferta)}
              className="border border-zinc-300 bg-transparent px-2 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
            >
              <option value="porcentaje">% dcto.</option>
              <option value="monto_fijo">$ dcto.</option>
            </select>
            <PrecioInput
              value={valorOferta}
              onChange={setValorOferta}
              prefijo={tipoOferta === "monto_fijo" ? "$" : null}
              sufijo={tipoOferta === "porcentaje" ? "%" : undefined}
              className="w-28 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
            />
            {valorOferta && (
              <button
                type="button"
                onClick={() => setValorOferta("")}
                className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Quitar
              </button>
            )}
          </div>

          {valorOferta && (
            <>
              {precioOfertaVista !== null && precioOfertaVista > 0 && (
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Precio en oferta:{" "}
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    ${precioOfertaVista.toLocaleString("es-CL")}
                  </span>
                </p>
              )}

              <label className="mt-2 block text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                Vence (opcional)
              </label>
              <input
                type="date"
                value={ofertaHasta}
                onChange={(e) => setOfertaHasta(e.target.value)}
                className="mt-1 border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white"
              />
            </>
          )}
        </div>
      </div>

      {!modoSimple && <MedidasPorTalla filas={filas} onActualizarFila={actualizarFila} />}

      <div className="flex gap-3">
        <button
          onClick={guardarCambios}
          disabled={guardando}
          className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          onClick={cancelar}
          disabled={guardando}
          className="border border-black/8 px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:opacity-70 disabled:opacity-50 dark:border-white/[.145]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
