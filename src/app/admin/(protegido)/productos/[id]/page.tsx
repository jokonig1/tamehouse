"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CategoriaSelect from "@/components/admin/CategoriaSelect";
import ImagenesEditor from "@/components/admin/ImagenesEditor";
import PrecioInput from "@/components/admin/PrecioInput";
import TallaGrid from "@/components/admin/TallaGrid";
import { campoClase, etiquetaClase, sinFlechasClase } from "@/components/admin/ProductoForm";
import { eliminarImagenProducto, subirImagenProducto } from "@/lib/imagenes";
import type { FilaTalla, Producto, ProductoImagen, Variante } from "@/lib/types";

type ModoStock = "unico" | "talla";

const FILA_INICIAL: FilaTalla = { id: null, talla: "", stock: "0" };

export default function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [cargaExitosa, setCargaExitosa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [activo, setActivo] = useState(true);

  const [modoStock, setModoStock] = useState<ModoStock>("unico");
  const [stockUnico, setStockUnico] = useState("0");
  const [varianteUnicaId, setVarianteUnicaId] = useState<string | null>(null);
  const [filas, setFilas] = useState<FilaTalla[]>([FILA_INICIAL]);
  const [idsIniciales, setIdsIniciales] = useState<string[]>([]);

  const [imagenesExistentes, setImagenesExistentes] = useState<ProductoImagen[]>([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState<ProductoImagen[]>([]);
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);

  const [altoCm, setAltoCm] = useState("");
  const [anchoCm, setAnchoCm] = useState("");
  const [largoCm, setLargoCm] = useState("");
  const [pesoKg, setPesoKg] = useState("");

  const cargarDatos = useCallback(async () => {
    setCargando(true);

    const [
      { data: producto, error: errorProducto },
      { data: variantes, error: errorVariantes },
      { data: imagenes, error: errorImagenes },
    ] = await Promise.all([
      supabase
        .from("productos")
        .select(
          "id, nombre, descripcion, precio, categoria, activo, alto_cm, ancho_cm, largo_cm, peso_kg, created_at"
        )
        .eq("id", id)
        .single(),
      supabase
        .from("variantes")
        .select("id, producto_id, talla, color, stock, created_at")
        .eq("producto_id", id)
        .order("talla", { ascending: true }),
      supabase
        .from("producto_imagenes")
        .select("id, producto_id, url, orden, created_at")
        .eq("producto_id", id)
        .order("orden", { ascending: true }),
    ]);

    if (errorProducto || !producto) {
      setError(errorProducto?.message ?? "Producto no encontrado.");
      setCargando(false);
      return;
    }

    if (errorVariantes) {
      setError(errorVariantes.message);
      setCargando(false);
      return;
    }

    if (errorImagenes) {
      setError(errorImagenes.message);
      setCargando(false);
      return;
    }

    setImagenesExistentes((imagenes ?? []) as ProductoImagen[]);
    setImagenesAEliminar([]);
    setArchivosNuevos([]);

    const p = producto as Producto;
    setNombre(p.nombre);
    setDescripcion(p.descripcion ?? "");
    setPrecio(String(p.precio));
    setCategoria(p.categoria ?? "");
    setActivo(p.activo);
    setAltoCm(p.alto_cm !== null ? String(p.alto_cm) : "");
    setAnchoCm(p.ancho_cm !== null ? String(p.ancho_cm) : "");
    setLargoCm(p.largo_cm !== null ? String(p.largo_cm) : "");
    setPesoKg(p.peso_kg !== null ? String(p.peso_kg) : "");

    const variantesData = (variantes ?? []) as Variante[];
    setIdsIniciales(variantesData.map((v) => v.id));

    const usaTalla = variantesData.some((v) => v.talla !== null && v.talla !== "");

    if (usaTalla) {
      setModoStock("talla");
      setFilas(variantesData.map((v) => ({ id: v.id, talla: v.talla ?? "", stock: String(v.stock) })));
      setVarianteUnicaId(null);
    } else {
      setModoStock("unico");
      const unica = variantesData[0];
      setStockUnico(unica ? String(unica.stock) : "0");
      setVarianteUnicaId(unica ? unica.id : null);
      setFilas([FILA_INICIAL]);
    }

    setCargaExitosa(true);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargarDatos();
  }, [cargarDatos]);

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

  function eliminarImagenExistente(imagenId: string) {
    const imagen = imagenesExistentes.find((img) => img.id === imagenId);
    if (!imagen) return;
    setImagenesExistentes((prev) => prev.filter((img) => img.id !== imagenId));
    setImagenesAEliminar((prev) => [...prev, imagen]);
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

    const { error: errorProducto } = await supabase
      .from("productos")
      .update({
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
      .eq("id", id);

    if (errorProducto) {
      setError(errorProducto.message);
      setGuardando(false);
      return;
    }

    const filasFinal: FilaTalla[] =
      modoStock === "unico" ? [{ id: varianteUnicaId, talla: "", stock: stockUnico }] : filas;

    const idsFinal = filasFinal.filter((f) => f.id !== null).map((f) => f.id as string);
    const idsAEliminar = idsIniciales.filter((i) => !idsFinal.includes(i));

    if (idsAEliminar.length) {
      const { error: errorDelete } = await supabase.from("variantes").delete().in("id", idsAEliminar);
      if (errorDelete) {
        setError(`No se pudo actualizar el stock: ${errorDelete.message}`);
        setGuardando(false);
        return;
      }
    }

    const nuevas = filasFinal
      .filter((f) => f.id === null)
      .map((f) => ({
        producto_id: id,
        talla: f.talla.trim() || null,
        color: null,
        stock: Number(f.stock),
      }));

    if (nuevas.length) {
      const { error: errorInsert } = await supabase.from("variantes").insert(nuevas);
      if (errorInsert) {
        setError(`No se pudo actualizar el stock: ${errorInsert.message}`);
        setGuardando(false);
        return;
      }
    }

    const existentes = filasFinal.filter((f) => f.id !== null);
    for (const f of existentes) {
      const { error: errorUpdate } = await supabase
        .from("variantes")
        .update({ talla: f.talla.trim() || null, stock: Number(f.stock) })
        .eq("id", f.id as string);

      if (errorUpdate) {
        setError(`No se pudo actualizar el stock: ${errorUpdate.message}`);
        setGuardando(false);
        return;
      }
    }

    for (const imagen of imagenesAEliminar) {
      const { error: errorEliminarImagen } = await eliminarImagenProducto(imagen);
      if (errorEliminarImagen) {
        setError(`No se pudieron actualizar las imágenes: ${errorEliminarImagen}`);
        setGuardando(false);
        return;
      }
    }

    if (archivosNuevos.length) {
      const ordenBase = imagenesExistentes.length;
      const resultados = await Promise.all(
        archivosNuevos.map((archivo, index) =>
          subirImagenProducto(id, archivo, ordenBase + index)
        )
      );
      const fallo = resultados.find((r) => r.error);
      if (fallo?.error) {
        setError(`No se pudieron subir las imágenes: ${fallo.error}`);
        setGuardando(false);
        return;
      }
    }

    router.push("/admin/productos");
  }

  async function eliminarProducto() {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    router.push("/admin/productos");
  }

  if (cargando) return <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>;
  if (!cargaExitosa)
    return (
      <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Producto no encontrado."}</p>
    );

  return (
    <div>
      <Link
        href="/admin/productos"
        className="mb-4 inline-block text-xs font-medium uppercase tracking-widest hover:opacity-70"
      >
        ← Volver
      </Link>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Editar producto</h1>

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
          imagenesExistentes={imagenesExistentes}
          archivosNuevos={archivosNuevos}
          onAgregarArchivos={agregarArchivos}
          onEliminarExistente={eliminarImagenExistente}
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

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={guardando}
            className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={eliminarProducto}
            className="text-xs font-medium uppercase tracking-widest text-red-600 hover:opacity-70 dark:text-red-400"
          >
            Eliminar producto
          </button>
        </div>
      </form>
    </div>
  );
}
