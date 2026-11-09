// Carga el catálogo real en Supabase a partir de scripts/catalogo.csv:
// comprime cada foto a WebP en dos tamaños (miniatura y grande), la sube
// al bucket "productos" y crea los productos, sus variantes y sus imágenes
// igual que lo hace el formulario de "Nuevo producto" del panel.
//
// Se ejecuta en el computador (no en Supabase), desde la raíz del proyecto:
//
//   node scripts/cargar-catalogo.mjs --fotos "D:\Descargas\catalogo tamehouse"
//     Simulación: revisa la planilla y las fotos y muestra qué haría.
//     No toca la base de datos.
//
//   node scripts/cargar-catalogo.mjs --fotos "..." --comprimir-en ./fotos-comprimidas
//     Igual que la simulación, pero además guarda las fotos comprimidas en
//     esa carpeta para revisarlas a ojo antes de subirlas.
//
//   node scripts/cargar-catalogo.mjs --fotos "..." --borrar-actuales --confirmar
//     Borra los productos que hay hoy en la tienda y carga el catálogo.
//     Sin --borrar-actuales, agrega el catálogo sin borrar nada.
//
// Los productos actuales que aparecen en algún pedido no se borran (el
// pedido quedaría apuntando a nada): se desactivan, para que no se vean
// en la tienda.
//
// Usa SUPABASE_SERVICE_ROLE_KEY de .env.local, así que solo debe correrse
// en el computador de alguien del equipo, nunca en el sitio.

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const BUCKET = "productos";
const PLANILLA = path.join("scripts", "catalogo.csv");

// Tamaño de despacho: la clienta declara siempre la caja más chica de
// Chilexpress, el mismo paquete fijo que usa el panel al generar envíos
// (PAQUETE_FIJO en src/components/admin/PedidoRow.tsx).
const PAQUETE = { peso_kg: 1, alto_cm: 10, ancho_cm: 10, largo_cm: 10 };

// Lado más largo de cada versión de la foto. La grande es para la ficha
// de producto; la miniatura, para catálogo, carrito y home.
const TAMANO_GRANDE = 1600;
const TAMANO_MINIATURA = 800;
const CALIDAD_WEBP = 80;

const EXTENSIONES_VALIDAS = [".jpg", ".jpeg", ".png", ".webp"];

// ---------- argumentos ----------

function leerArgumentos(argv) {
  const args = { fotos: null, comprimirEn: null, borrarActuales: false, confirmar: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--fotos") args.fotos = argv[++i];
    else if (a === "--comprimir-en") args.comprimirEn = argv[++i];
    else if (a === "--borrar-actuales") args.borrarActuales = true;
    else if (a === "--confirmar") args.confirmar = true;
    else throw new Error(`Argumento desconocido: ${a}`);
  }
  if (!args.fotos) throw new Error('Falta --fotos "<carpeta con las fotos>".');
  return args;
}

// ---------- .env.local ----------

function leerEnv() {
  const archivo = ".env.local";
  if (!fs.existsSync(archivo)) throw new Error("No se encontró .env.local en la raíz del proyecto.");
  const env = {};
  for (const linea of fs.readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const i = linea.indexOf("=");
    if (i === -1 || linea.trim().startsWith("#")) continue;
    env[linea.slice(0, i).trim()] = linea.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  for (const clave of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!env[clave]) throw new Error(`Falta ${clave} en .env.local.`);
  }
  return env;
}

// ---------- planilla ----------

// Una fila por variante. Producto, categoría y precio se repiten en cada
// talla; las fotos pueden ir en cualquier fila del producto (se juntan).
// Separador ";" para que Excel en español la abra en columnas.
function leerPlanilla(carpetaFotos) {
  const texto = fs.readFileSync(PLANILLA, "utf8").replace(/^\uFEFF/, "");
  const lineas = texto.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
  const encabezado = lineas.shift().split(";").map((c) => c.trim().toLowerCase());
  const esperado = ["producto", "categoria", "precio", "talla", "stock", "ancho_cm", "largo_cm", "fotos"];
  if (esperado.some((c, i) => encabezado[i] !== c)) {
    throw new Error(`La planilla debe tener las columnas: ${esperado.join(";")}`);
  }

  const errores = [];
  const productos = new Map();

  lineas.forEach((linea, n) => {
    const fila = n + 2;
    const [nombre, categoria, precioTxt, talla, stockTxt, ancho, largo, fotosTxt] = linea
      .split(";")
      .map((c) => (c ?? "").trim());

    if (!nombre) return errores.push(`Fila ${fila}: falta el nombre del producto.`);
    const precio = Number(precioTxt);
    if (!Number.isInteger(precio) || precio <= 0) errores.push(`Fila ${fila}: precio inválido ("${precioTxt}").`);
    const stock = Number(stockTxt);
    if (!Number.isInteger(stock) || stock < 0) errores.push(`Fila ${fila}: stock inválido ("${stockTxt}").`);

    if (!productos.has(nombre)) {
      productos.set(nombre, { nombre, categoria: categoria || null, precio, variantes: [], fotos: [] });
    }
    const producto = productos.get(nombre);
    if (producto.precio !== precio) errores.push(`Fila ${fila}: "${nombre}" tiene dos precios distintos.`);

    const medidas = [];
    if (ancho) medidas.push({ etiqueta: "Ancho (cm)", valor: ancho });
    if (largo) medidas.push({ etiqueta: "Largo (cm)", valor: largo });
    producto.variantes.push({ talla: talla || null, stock, medidas });

    for (const foto of (fotosTxt ?? "").split("|").map((f) => f.trim()).filter(Boolean)) {
      if (!producto.fotos.includes(foto)) producto.fotos.push(foto);
    }
  });

  for (const p of productos.values()) {
    const tallas = p.variantes.map((v) => v.talla);
    if (tallas.length > 1 && tallas.some((t) => !t)) {
      errores.push(`"${p.nombre}": si tiene varias filas, todas necesitan talla.`);
    }
    if (new Set(tallas).size !== tallas.length) errores.push(`"${p.nombre}": tiene una talla repetida.`);
    if (p.fotos.length === 0) errores.push(`"${p.nombre}": no tiene fotos.`);
    for (const foto of p.fotos) {
      const ruta = path.join(carpetaFotos, foto);
      if (!fs.existsSync(ruta)) errores.push(`"${p.nombre}": no existe la foto ${foto}.`);
      else if (!EXTENSIONES_VALIDAS.includes(path.extname(foto).toLowerCase())) {
        errores.push(`"${p.nombre}": ${foto} no es JPG, PNG ni WebP (las fotos HEIC de iPhone hay que exportarlas a JPG).`);
      }
    }
  }

  return { productos: [...productos.values()], errores };
}

// ---------- fotos ----------

function comprimir(ruta, lado) {
  return sharp(ruta)
    .rotate() // respeta la orientación EXIF de las fotos de celular
    .resize({ width: lado, height: lado, fit: "inside", withoutEnlargement: true })
    .webp({ quality: CALIDAD_WEBP })
    .toBuffer();
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// ---------- Supabase ----------

async function borrarActuales(sb) {
  const { data: actuales, error } = await sb.from("productos").select("id, nombre, variantes(id)");
  if (error) throw new Error(`No se pudieron leer los productos actuales: ${error.message}`);

  const idsVariantes = actuales.flatMap((p) => p.variantes.map((v) => v.id));
  const conPedidos = new Set();
  if (idsVariantes.length) {
    const { data: items, error: errorItems } = await sb
      .from("pedido_items")
      .select("variante_id")
      .in("variante_id", idsVariantes);
    if (errorItems) throw new Error(`No se pudieron revisar los pedidos: ${errorItems.message}`);
    const variantesConPedido = new Set(items.map((i) => i.variante_id));
    for (const p of actuales) {
      if (p.variantes.some((v) => variantesConPedido.has(v.id))) conPedidos.add(p.id);
    }
  }

  for (const p of actuales) {
    if (conPedidos.has(p.id)) {
      const { error: e } = await sb.from("productos").update({ activo: false }).eq("id", p.id);
      console.log(e ? `  ✗ No se pudo desactivar "${p.nombre}": ${e.message}` : `  – Desactivado (tiene pedidos): ${p.nombre}`);
      continue;
    }
    const { data: archivos } = await sb.storage.from(BUCKET).list(p.id, { limit: 1000 });
    if (archivos?.length) await sb.storage.from(BUCKET).remove(archivos.map((a) => `${p.id}/${a.name}`));
    const { error: e } = await sb.from("productos").delete().eq("id", p.id);
    console.log(e ? `  ✗ No se pudo borrar "${p.nombre}": ${e.message}` : `  – Borrado: ${p.nombre}`);
  }
}

async function subirFoto(sb, productoId, ruta, orden) {
  const [grande, miniatura] = await Promise.all([comprimir(ruta, TAMANO_GRANDE), comprimir(ruta, TAMANO_MINIATURA)]);
  const base = `${productoId}/${randomUUID()}`;
  const opciones = { contentType: "image/webp", cacheControl: "31536000" };

  for (const [sufijo, buffer] of [["full", grande], ["thumb", miniatura]]) {
    const { error } = await sb.storage.from(BUCKET).upload(`${base}-${sufijo}.webp`, buffer, opciones);
    if (error) throw new Error(`no se pudo subir ${path.basename(ruta)}: ${error.message}`);
  }

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(`${base}-full.webp`);
  const { error } = await sb.from("producto_imagenes").insert({ producto_id: productoId, url: publicUrl, orden });
  if (error) throw new Error(`no se pudo registrar ${path.basename(ruta)}: ${error.message}`);
  return grande.length + miniatura.length;
}

async function crearProducto(sb, p, carpetaFotos) {
  const { data: producto, error } = await sb
    .from("productos")
    .insert({ nombre: p.nombre, descripcion: null, precio: p.precio, categoria: p.categoria, activo: true, ...PAQUETE })
    .select("id")
    .single();
  if (error) throw new Error(`no se pudo crear: ${error.message}`);

  const { error: errorVariantes } = await sb
    .from("variantes")
    .insert(p.variantes.map((v) => ({ producto_id: producto.id, talla: v.talla, color: null, stock: v.stock, medidas: v.medidas })));
  if (errorVariantes) throw new Error(`se creó, pero no se pudo guardar el stock: ${errorVariantes.message}`);

  let bytes = 0;
  for (const [orden, foto] of p.fotos.entries()) {
    bytes += await subirFoto(sb, producto.id, path.join(carpetaFotos, foto), orden);
  }
  return bytes;
}

// ---------- principal ----------

async function main() {
  const args = leerArgumentos(process.argv.slice(2));
  const { productos, errores } = leerPlanilla(args.fotos);

  console.log(`\nPlanilla: ${productos.length} productos\n`);
  for (const p of productos) {
    const stock = p.variantes.map((v) => (v.talla ? `${v.talla}:${v.stock}` : `${v.stock}`)).join(" ");
    console.log(`  ${p.nombre.padEnd(24)} ${String(p.categoria ?? "").padEnd(11)} $${String(p.precio).padStart(6)}  stock ${stock.padEnd(18)} ${p.fotos.length} foto(s)`);
  }

  if (errores.length) {
    console.log("\nHay errores en la planilla. No se cargó nada:\n");
    errores.forEach((e) => console.log(`  ✗ ${e}`));
    process.exit(1);
  }

  if (args.comprimirEn) {
    fs.mkdirSync(args.comprimirEn, { recursive: true });
    const fotos = [...new Set(productos.flatMap((p) => p.fotos))];
    let original = 0;
    let comprimido = 0;
    console.log(`\nComprimiendo ${fotos.length} fotos en ${args.comprimirEn}…`);
    for (const foto of fotos) {
      const ruta = path.join(args.fotos, foto);
      const base = path.parse(foto).name.replace(/\.(jpe?g|png)$/i, "");
      const [grande, miniatura] = await Promise.all([comprimir(ruta, TAMANO_GRANDE), comprimir(ruta, TAMANO_MINIATURA)]);
      fs.writeFileSync(path.join(args.comprimirEn, `${base}-full.webp`), grande);
      fs.writeFileSync(path.join(args.comprimirEn, `${base}-thumb.webp`), miniatura);
      original += fs.statSync(ruta).size;
      comprimido += grande.length + miniatura.length;
      console.log(`  ${foto.padEnd(48)} ${kb(fs.statSync(ruta).size).padStart(8)} → grande ${kb(grande.length).padStart(7)}, miniatura ${kb(miniatura.length).padStart(6)}`);
    }
    console.log(`\n  Total: ${kb(original)} originales → ${kb(comprimido)} comprimidas (ambos tamaños).`);
  }

  if (!args.confirmar) {
    console.log("\nSimulación lista: no se tocó la base de datos.");
    console.log("Para cargar de verdad, agrega --confirmar (y --borrar-actuales para sacar los productos de prueba).\n");
    return;
  }

  const env = leerEnv();
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  if (args.borrarActuales) {
    console.log("\nSacando los productos actuales…");
    await borrarActuales(sb);
  }

  console.log("\nCargando el catálogo…");
  let fallidos = 0;
  let bytesTotales = 0;
  for (const p of productos) {
    try {
      const bytes = await crearProducto(sb, p, args.fotos);
      bytesTotales += bytes;
      console.log(`  ✓ ${p.nombre} (${p.fotos.length} foto(s), ${kb(bytes)})`);
    } catch (err) {
      fallidos++;
      console.log(`  ✗ ${p.nombre}: ${err.message}`);
    }
  }

  console.log(`\nListo: ${productos.length - fallidos} de ${productos.length} productos cargados, ${kb(bytesTotales)} en fotos.`);
  if (fallidos) {
    console.log("Los que fallaron se pueden terminar desde el panel, o borrarlos y volver a correr el script.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}\n`);
  process.exit(1);
});
