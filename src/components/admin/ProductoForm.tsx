"use client";

import { useState, type FormEvent } from "react";

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
    <form onSubmit={manejarSubmit} className="max-w-xl space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea
          value={descripcion ?? ""}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full rounded border border-neutral-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Precio (CLP)</label>
          <input
            type="number"
            min={0}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <input
            type="text"
            value={categoria ?? ""}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        Visible en la tienda
      </label>

      <fieldset className="rounded border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-medium">
          Datos de envío (uso interno, no se muestran al público)
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm">Alto (cm)</label>
            <input
              type="number"
              min={0}
              value={altoCm}
              onChange={(e) => setAltoCm(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Ancho (cm)</label>
            <input
              type="number"
              min={0}
              value={anchoCm}
              onChange={(e) => setAnchoCm(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Largo (cm)</label>
            <input
              type="number"
              min={0}
              value={largoCm}
              onChange={(e) => setLargoCm(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Peso (kg)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2"
            />
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={guardando}
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {guardando ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
