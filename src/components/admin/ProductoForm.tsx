"use client";

import { useState, type FormEvent } from "react";
import CategoriaSelect from "@/components/admin/CategoriaSelect";
import PrecioInput from "@/components/admin/PrecioInput";

export interface ProductoFormValues {
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string | null;
  activo: boolean;
  alto_cm: number | null;
  ancho_cm: number | null;
  largo_cm: number | null;
  peso_kg: number | null;
}

interface ProductoFormProps {
  valoresIniciales?: Partial<ProductoFormValues>;
  onGuardar: (valores: ProductoFormValues) => Promise<void>;
  textoBoton: string;
}

export const campoClase =
  "w-full border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:focus:border-white";
export const etiquetaClase =
  "mb-1 block text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400";
export const sinFlechasClase =
  "[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none";

export const tarjetaClase =
  "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-900";
export const campoClaseRedondeado =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-400";
export const etiquetaClaseFuerte =
  "mb-1.5 block text-xs font-semibold text-zinc-700 dark:text-zinc-300";

export default function ProductoForm({
  valoresIniciales,
  onGuardar,
  textoBoton,
}: ProductoFormProps) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(valoresIniciales?.descripcion ?? "");
  const [precio, setPrecio] = useState(valoresIniciales?.precio?.toString() ?? "");
  const [categoria, setCategoria] = useState(valoresIniciales?.categoria ?? "");
  const [activo, setActivo] = useState(valoresIniciales?.activo ?? true);
  const [altoCm, setAltoCm] = useState(valoresIniciales?.alto_cm?.toString() ?? "");
  const [anchoCm, setAnchoCm] = useState(valoresIniciales?.ancho_cm?.toString() ?? "");
  const [largoCm, setLargoCm] = useState(valoresIniciales?.largo_cm?.toString() ?? "");
  const [pesoKg, setPesoKg] = useState(valoresIniciales?.peso_kg?.toString() ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const precioNumero = Number(precio);
    if (!precio || Number.isNaN(precioNumero) || precioNumero <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: precioNumero,
        categoria: categoria.trim() || null,
        activo,
        alto_cm: altoCm ? Number(altoCm) : null,
        ancho_cm: anchoCm ? Number(anchoCm) : null,
        largo_cm: largoCm ? Number(largoCm) : null,
        peso_kg: pesoKg ? Number(pesoKg) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit} className="max-w-xl space-y-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div>
        <label className={etiquetaClase}>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={campoClase}
        />
      </div>

      <div>
        <label className={etiquetaClase}>Descripción</label>
        <textarea
          value={descripcion ?? ""}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className={campoClase}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={etiquetaClase}>Precio (CLP)</label>
          <PrecioInput value={precio} onChange={setPrecio} className={campoClase} />
        </div>
        <div>
          <label className={etiquetaClase}>Categoría</label>
          <CategoriaSelect value={categoria ?? ""} onChange={setCategoria} className={campoClase} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        Visible en la tienda
      </label>

      <fieldset className="border border-black/8 p-4 dark:border-white/[.145]">
        <legend className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
          Datos de envío (uso interno, no se muestran al público)
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <label className={etiquetaClase}>Alto (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="0.0"
              value={altoCm}
              onChange={(e) => setAltoCm(e.target.value)}
              className={`${campoClase} ${sinFlechasClase}`}
            />
          </div>
          <div>
            <label className={etiquetaClase}>Ancho (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="0.0"
              value={anchoCm}
              onChange={(e) => setAnchoCm(e.target.value)}
              className={`${campoClase} ${sinFlechasClase}`}
            />
          </div>
          <div>
            <label className={etiquetaClase}>Largo (cm)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="0.0"
              value={largoCm}
              onChange={(e) => setLargoCm(e.target.value)}
              className={`${campoClase} ${sinFlechasClase}`}
            />
          </div>
          <div>
            <label className={etiquetaClase}>Peso (kg)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              className={`${campoClase} ${sinFlechasClase}`}
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={guardando}
        className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {guardando ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
