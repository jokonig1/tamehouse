"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CategoriaSelect from "@/components/admin/CategoriaSelect";
import ImagenesEditor from "@/components/admin/ImagenesEditor";
import PrecioInput from "@/components/admin/PrecioInput";
import TallaGrid from "@/components/admin/TallaGrid";
import {
  campoClaseRedondeado,
  etiquetaClaseFuerte,
  sinFlechasClase,
  tarjetaClase,
} from "@/components/admin/ProductoForm";
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
      <nav className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Panel admin
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/admin/productos" className="hover:text-black dark:hover:text-white">
          Productos
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Nuevo producto</span>
      </nav>

      <Link
        href="/admin/productos"
        className="mb-2 inline-block text-xs font-medium uppercase tracking-widest hover:opacity-70"
      >
        ← Volver
      </Link>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">Nuevo producto</h1>

      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <form onSubmit={manejarSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className={`${tarjetaClase} space-y-6`}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            Información del producto
          </h2>

          <div>
            <label className={etiquetaClaseFuerte}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={campoClaseRedondeado}
            />
          </div>

          <div>
            <label className={etiquetaClaseFuerte}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className={campoClaseRedondeado}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={etiquetaClaseFuerte}>Precio (CLP)</label>
              <PrecioInput value={precio} onChange={setPrecio} className={campoClaseRedondeado} />
            </div>
            <div>
              <label className={etiquetaClaseFuerte}>Categoría</label>
              <CategoriaSelect
                value={categoria}
                onChange={setCategoria}
                className={campoClaseRedondeado}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={activo}
              aria-label={activo ? "Visible en la tienda" : "Oculto de la tienda"}
              onClick={() => setActivo((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                activo ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  activo ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              {activo ? "Visible en la tienda" : "Oculto de la tienda"}
            </span>
          </div>

          <div>
            <label className={etiquetaClaseFuerte}>Stock</label>

            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setModoStock("unico")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                  modoStock === "unico"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                Único
              </button>
              <button
                type="button"
                onClick={() => setModoStock("talla")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                  modoStock === "talla"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                Por talla
              </button>
            </div>

            {modoStock === "unico" ? (
              <input
                type="number"
                min={0}
                value={stockUnico}
                onChange={(e) => setStockUnico(e.target.value)}
                className={`w-32 ${campoClaseRedondeado}`}
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

          <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-white/[.145]">
            <legend className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Datos de envío (uso interno, no se muestran al público)
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label className={etiquetaClaseFuerte}>Alto (cm)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="0.0"
                  value={altoCm}
                  onChange={(e) => setAltoCm(e.target.value)}
                  className={`${campoClaseRedondeado} ${sinFlechasClase}`}
                />
              </div>
              <div>
                <label className={etiquetaClaseFuerte}>Ancho (cm)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="0.0"
                  value={anchoCm}
                  onChange={(e) => setAnchoCm(e.target.value)}
                  className={`${campoClaseRedondeado} ${sinFlechasClase}`}
                />
              </div>
              <div>
                <label className={etiquetaClaseFuerte}>Largo (cm)</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="0.0"
                  value={largoCm}
                  onChange={(e) => setLargoCm(e.target.value)}
                  className={`${campoClaseRedondeado} ${sinFlechasClase}`}
                />
              </div>
              <div>
                <label className={etiquetaClaseFuerte}>Peso (kg)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={pesoKg}
                  onChange={(e) => setPesoKg(e.target.value)}
                  className={`${campoClaseRedondeado} ${sinFlechasClase}`}
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className={`${tarjetaClase} h-fit space-y-4`}>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            Imágenes
          </h2>

          <ImagenesEditor
            imagenesExistentes={[]}
            archivosNuevos={archivosNuevos}
            onAgregarArchivos={agregarArchivos}
            onEliminarExistente={() => {}}
            onQuitarNuevo={quitarArchivoNuevo}
          />

          <button
            type="submit"
            disabled={guardando}
            className="w-full rounded-full bg-blue-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-80 disabled:opacity-50"
          >
            {guardando ? "Creando..." : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
