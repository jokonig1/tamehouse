"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CategoriaSelect from "@/components/admin/CategoriaSelect";
import ImagenesEditor from "@/components/admin/ImagenesEditor";
import PrecioInput from "@/components/admin/PrecioInput";
import TallaGrid from "@/components/admin/TallaGrid";
import { campoClase, etiquetaClase, sinFlechasClase } from "@/components/admin/ProductoForm";
import { subirImagenProducto } from "@/lib/imagenes";
import type { FilaTalla } from "@/lib/types";

type ModoStock = "unico" | "talla";

const FILA_INICIAL: FilaTalla = { id: null, talla: "", stock: "0" };

export default function NuevoProductoPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [activo, setActivo] = useState(true);

  const [modoStock, setModoStock] = useState<ModoStock>("unico");
  const [stockUnico, setStockUnico] = useState("0");
  const [filas, setFilas] = useState<FilaTalla[]>([FILA_INICIAL]);

  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);

  const [altoCm, setAltoCm] = useState("");
  const [anchoCm, setAnchoCm] = useState("");
  const [largoCm, setLargoCm] = useState("");
  const [pesoKg, setPesoKg] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function actualizarFila(index: number, cambios: Partial<FilaTalla>) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambios } : f)));
  }

  function agregarTalla() {
    setFilas((prev) => [...prev, { id: null, talla: "", stock: "0" }]);
  }

  function eliminarFila(index: number) {
    setFilas((prev) => {
      const restante = prev.filter((_, i) => i !== index);
      return restante.length > 0 ? restante : [FILA_INICIAL];
    });
  }

  function agregarArchivos(archivos: File[]) {
    setArchivosNuevos((prev) => [...prev, ...archivos]);
  }

  function quitarArchivoNuevo(index: number) {
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
  }

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

    if (modoStock === "unico") {
      const stockNumero = Number(stockUnico);
      if (stockUnico.trim() === "" || Number.isNaN(stockNumero) || stockNumero < 0) {
        setError("El stock debe ser un número válido (0 o más).");
        return;
      }
    } else {
      for (const fila of filas) {
        const stockNumero = Number(fila.stock);
        if (fila.stock.trim() === "" || Number.isNaN(stockNumero) || stockNumero < 0) {
          setError("Cada talla necesita un stock válido (0 o más).");
          return;
        }
      }
    }

    setGuardando(true);

    const { data: producto, error: errorProducto } = await supabase
      .from("productos")
      .insert({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: precioNumero,
        categoria: categoria.trim() || null,
        activo,
        alto_cm: altoCm ? Number(altoCm) : null,
        ancho_cm: anchoCm ? Number(anchoCm) : null,
        largo_cm: largoCm ? Number(largoCm) : null,
        peso_kg: pesoKg ? Number(pesoKg) : null,
      })
      .select("id")
      .single();

    if (errorProducto || !producto) {
      setError(errorProducto?.message ?? "No se pudo crear el producto.");
      setGuardando(false);
      return;
    }

    const nuevasVariantes =
      modoStock === "unico"
        ? [{ producto_id: producto.id, talla: null, color: null, stock: Number(stockUnico) }]
        : filas.map((f) => ({
            producto_id: producto.id,
            talla: f.talla.trim() || null,
            color: null,
            stock: Number(f.stock),
          }));

    const { error: errorVariantes } = await supabase.from("variantes").insert(nuevasVariantes);

    if (errorVariantes) {
      setError(
        `El producto se creó, pero no se pudo guardar el stock: ${errorVariantes.message}. Puedes agregarlo desde la lista de productos.`
      );
      setGuardando(false);
      return;
    }

    if (archivosNuevos.length) {
      const resultados = await Promise.all(
        archivosNuevos.map((archivo, index) => subirImagenProducto(producto.id, archivo, index))
      );
      const fallo = resultados.find((r) => r.error);
      if (fallo?.error) {
        setError(
          `El producto se creó, pero una imagen no se pudo subir: ${fallo.error}. Puedes agregarla desde la edición del producto.`
        );
        setGuardando(false);
        return;
      }
    }

    router.push("/admin/productos");
  }

  return (
    <div>
      <Link
        href="/admin/productos"
        className="mb-4 inline-block text-xs font-medium uppercase tracking-widest hover:opacity-70"
      >
        ← Volver
      </Link>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Nuevo producto</h1>

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
            value={descripcion}
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
            <CategoriaSelect value={categoria} onChange={setCategoria} className={campoClase} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          Visible en la tienda
        </label>

        <ImagenesEditor
          imagenesExistentes={[]}
          archivosNuevos={archivosNuevos}
          onAgregarArchivos={agregarArchivos}
          onEliminarExistente={() => {}}
          onQuitarNuevo={quitarArchivoNuevo}
        />

        <div>
          <label className={etiquetaClase}>Stock</label>

          <div className="mb-3 flex gap-6 text-xs font-medium uppercase tracking-widest">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modoStock"
                checked={modoStock === "unico"}
                onChange={() => setModoStock("unico")}
              />
              Único
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modoStock"
                checked={modoStock === "talla"}
                onChange={() => setModoStock("talla")}
              />
              Por talla
            </label>
          </div>

          {modoStock === "unico" ? (
            <input
              type="number"
              min={0}
              value={stockUnico}
              onChange={(e) => setStockUnico(e.target.value)}
              className={`w-32 ${campoClase}`}
            />
          ) : (
            <TallaGrid
              filas={filas}
              onActualizarFila={actualizarFila}
              onAgregarTalla={agregarTalla}
              onEliminarFila={eliminarFila}
            />
          )}
        </div>

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
          {guardando ? "Creando..." : "Crear producto"}
        </button>
      </form>
    </div>
  );
}
