"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { campoClase, etiquetaClase } from "@/components/admin/ProductoForm";
import type { EstadoPedido, PedidoListado } from "@/lib/types";

const formatoPrecio = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

function formatoFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

const ESTADOS: {
  valor: EstadoPedido;
  label: string;
  pill: string;
}[] = [
  {
    valor: "pagado",
    label: "Pagado",
    pill: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  },
  {
    valor: "preparando",
    label: "Preparando",
    pill: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  },
  {
    valor: "despachado",
    label: "Despachado",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  {
    valor: "entregado",
    label: "Entregado",
    pill: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  },
];

interface ItemDetallado {
  id: string;
  cantidad: number;
  precioUnitario: number;
  productoNombre: string;
  talla: string | null;
  color: string | null;
}

interface VarianteEmbebida {
  talla: string | null;
  color: string | null;
  productos: {
    nombre: string;
  } | null;
}

// Paquete declarado para cotizar y generar el envío en Chilexpress.
// No se arma a partir de las medidas de cada producto (variaba según
// cuántos productos distintos tuviera el pedido) -- queda fijo en el
// tamaño más chico, que es el que la clienta usa siempre sin
// problemas al declarar sus envíos.
const PAQUETE_FIJO = { pesoKg: 1, altoCm: 10, anchoCm: 10, largoCm: 10 };

interface PedidoItemConsulta {
  id: string;
  cantidad: number;
  precio_unitario: number;
  variantes: VarianteEmbebida | null;
}

type EventoSeguimiento = {
  fecha: string;
  hora: string;
  descripcion: string;
  ubicacion: string | null;
};

type EstadoEnvio = {
  numeroOrden: string;
  estado: string;
  ubicacionEstado: string;
  producto: string;
  servicio: string;
  eventos: EventoSeguimiento[];
};

interface PedidoRowProps {
  pedido: PedidoListado;
}

export default function PedidoRow({ pedido }: PedidoRowProps) {
  const [expandido, setExpandido] = useState(false);
  const [estado, setEstado] = useState<EstadoPedido>(pedido.estado);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [seguimiento, setSeguimiento] = useState(pedido.numero_seguimiento ?? "");
  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);

  const [items, setItems] = useState<ItemDetallado[]>([]);
  const [cargandoItems, setCargandoItems] = useState(true);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio | null>(null);
  const [cargandoEstadoEnvio, setCargandoEstadoEnvio] = useState(false);
  const [errorEstadoEnvio, setErrorEstadoEnvio] = useState<string | null>(null);

  const [generandoEnvio, setGenerandoEnvio] = useState(false);
  const [errorGenerarEnvio, setErrorGenerarEnvio] = useState<string | null>(null);

  const [etiquetaBase64, setEtiquetaBase64] = useState<string | null>(null);
  const [cargandoEtiqueta, setCargandoEtiqueta] = useState(false);

  const cargarItems = useCallback(async () => {
    setCargandoItems(true);
    const { data, error } = await supabase
      .from("pedido_items")
      .select("id, cantidad, precio_unitario, variantes(talla, color, productos(nombre))")
      .eq("pedido_id", pedido.id);

    if (error) {
      setErrorItems(error.message);
      setCargandoItems(false);
      return;
    }

    const filas = (data ?? []) as unknown as PedidoItemConsulta[];
    setItems(
      filas.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_unitario,
        productoNombre: item.variantes?.productos?.nombre ?? "Producto eliminado",
        talla: item.variantes?.talla ?? null,
        color: item.variantes?.color ?? null,
      }))
    );
    setCargandoItems(false);
  }, [pedido.id]);

  useEffect(() => {
    if (expandido) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- carga los items al expandir la fila
      cargarItems();
    }
  }, [expandido, cargarItems]);

  async function actualizarEstado(nuevoEstado: EstadoPedido) {
    const anterior = estado;
    setEstado(nuevoEstado);
    setGuardandoEstado(true);

    const { error } = await supabase
      .from("pedidos")
      .update({ estado: nuevoEstado })
      .eq("id", pedido.id);

    setGuardandoEstado(false);
    if (error) {
      setEstado(anterior);
      alert(`No se pudo actualizar: ${error.message}`);
    }
  }

  async function guardarSeguimiento() {
    if (seguimiento.trim() === (pedido.numero_seguimiento ?? "")) return;
    setGuardandoSeguimiento(true);

    const { error } = await supabase
      .from("pedidos")
      .update({ numero_seguimiento: seguimiento.trim() || null })
      .eq("id", pedido.id);

    setGuardandoSeguimiento(false);
    if (error) alert(`No se pudo actualizar: ${error.message}`);
  }

  async function consultarEstadoEnvio() {
    setCargandoEstadoEnvio(true);
    setErrorEstadoEnvio(null);
    try {
      const res = await fetch("/api/chilexpress/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: pedido.id }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudo consultar el estado.");
      setEstadoEnvio(datos);
    } catch (err) {
      setErrorEstadoEnvio(err instanceof Error ? err.message : "No se pudo consultar el estado.");
    } finally {
      setCargandoEstadoEnvio(false);
    }
  }

  // Genera el envío real en Chilexpress para este pedido, con el
  // paquete declarado en PAQUETE_FIJO (ver comentario ahí arriba).
  async function generarEnvio() {
    if (
      !pedido.comuna_code ||
      !pedido.calle ||
      !pedido.numero ||
      !pedido.destinatario_nombre ||
      !pedido.destinatario_telefono ||
      !pedido.destinatario_email ||
      pedido.servicio_type_code === null
    ) {
      setErrorGenerarEnvio(
        "A este pedido le faltan datos de despacho (comuna, dirección, contacto o servicio)."
      );
      return;
    }

    if (!confirm("¿Generar el envío en Chilexpress para este pedido?")) return;

    setGenerandoEnvio(true);
    setErrorGenerarEnvio(null);

    try {
      const res = await fetch("/api/chilexpress/envio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId: pedido.id,
          destino: {
            countyCoverageCode: pedido.comuna_code,
            streetName: pedido.calle,
            streetNumber: Number(pedido.numero) || 0,
            supplement: pedido.depto ?? undefined,
          },
          destinatario: {
            nombre: pedido.destinatario_nombre,
            telefono: pedido.destinatario_telefono,
            email: pedido.destinatario_email,
          },
          paquete: {
            ...PAQUETE_FIJO,
            valorDeclarado: pedido.total,
            servicioTypeCode: pedido.servicio_type_code,
          },
          ...(pedido.retiro_oficina_code
            ? { retiroEnOficina: { officeCode: pedido.retiro_oficina_code } }
            : {}),
        }),
      });

      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudo generar el envío.");

      setSeguimiento(datos.numeroSeguimiento);
      setEtiquetaBase64(datos.etiquetaBase64 ?? null);
    } catch (err) {
      setErrorGenerarEnvio(err instanceof Error ? err.message : "No se pudo generar el envío.");
    } finally {
      setGenerandoEnvio(false);
    }
  }

  // La etiqueta no viaja en el listado de pedidos (pesa harto en
  // base64), así que si no la tenemos en memoria todavía -- por
  // ejemplo, se generó el envío en una sesión anterior -- se busca
  // recién al pedirla para imprimir.
  async function imprimirEtiqueta() {
    let etiqueta = etiquetaBase64;

    if (!etiqueta) {
      setCargandoEtiqueta(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("etiqueta_chilexpress")
        .eq("id", pedido.id)
        .single();
      setCargandoEtiqueta(false);

      if (error || !data?.etiqueta_chilexpress) {
        alert("No se pudo obtener la etiqueta.");
        return;
      }
      etiqueta = data.etiqueta_chilexpress;
      setEtiquetaBase64(etiqueta);
    }

    const ventana = window.open("", "_blank", "width=420,height=640");
    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head><title>Etiqueta ${pedido.id.slice(0, 8).toUpperCase()}</title></head>
        <body style="margin:0;display:flex;justify-content:center;">
          <img src="data:image/jpeg;base64,${etiqueta}" style="max-width:100%;" />
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  function imprimirBoleta() {
    const ventana = window.open("", "_blank", "width=420,height=640");
    if (!ventana) return;

    const filasItems = items
      .map((item) => {
        const variante = [item.talla, item.color].filter(Boolean).join(" · ");
        return `<tr>
          <td style="padding:6px 0;border-bottom:1px solid #ddd;">
            ${item.productoNombre}${variante ? `<br /><span style="color:#777;font-size:11px;">${variante}</span>` : ""}
          </td>
          <td style="padding:6px 0;border-bottom:1px solid #ddd;text-align:center;">×${item.cantidad}</td>
          <td style="padding:6px 0;border-bottom:1px solid #ddd;text-align:right;">${formatoPrecio.format(
            item.precioUnitario * item.cantidad
          )}</td>
        </tr>`;
      })
      .join("");

    ventana.document.write(`
      <html>
        <head>
          <title>Boleta ${pedido.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
            .total { font-weight: bold; font-size: 15px; margin-top: 12px; text-align: right; }
            .direccion { margin-top: 20px; font-size: 13px; }
            .etiqueta { text-transform: uppercase; letter-spacing: 0.05em; color: #777; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>Pedido ${pedido.id.slice(0, 8).toUpperCase()}</h1>
          <p>${pedido.clienteNombre ?? "Invitado"}</p>

          <div class="direccion">
            <p class="etiqueta">Enviar a</p>
            <p>${pedido.direccion ?? "-"}${pedido.comuna ? `, ${pedido.comuna}` : ""}</p>
          </div>

          <table>${filasItems}</table>
          <p class="total">Total: ${formatoPrecio.format(pedido.total)}</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  const estadoInfo = ESTADOS.find((e) => e.valor === estado) ?? ESTADOS[0];

  return (
    <div className="border-t border-black/8 dark:border-white/[.145]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpandido((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandido((v) => !v);
          }
        }}
        className="cursor-pointer px-4 py-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        {/* Tarjeta apilada (mobile) -- nunca scroll horizontal */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono font-semibold text-orange-600 dark:text-orange-500">
              {pedido.id.slice(0, 8).toUpperCase()}
            </span>
            <span aria-hidden="true" className="text-zinc-500">
              {expandido ? "▾" : "▸"}
            </span>
          </div>
          <span className="text-zinc-600 dark:text-zinc-400">
            {pedido.clienteNombre ?? "Invitado"}
          </span>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatoFecha(pedido.created_at)} · {pedido.itemsCount}{" "}
              {pedido.itemsCount === 1 ? "item" : "items"} · {formatoPrecio.format(pedido.total)}
            </span>
            <div
              className={`inline-flex w-fit items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 ${estadoInfo.pill}`}
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={estado}
                disabled={guardandoEstado}
                onChange={(e) => actualizarEstado(e.target.value as EstadoPedido)}
                className="cursor-pointer appearance-none border-none bg-transparent p-0 text-xs font-semibold uppercase tracking-widest outline-none disabled:cursor-wait"
              >
                {ESTADOS.map((e) => (
                  <option key={e.valor} value={e.valor} className="text-black">
                    {e.label}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="text-sm leading-none">▾</span>
            </div>
          </div>
        </div>

        {/* Fila en columnas (sm y más) */}
        <div className="hidden grid-cols-[1.5rem_1fr_1fr_1fr_0.7fr_1fr_1fr] items-center gap-6 sm:grid">
          <span aria-hidden="true" className="w-6 text-zinc-500">
            {expandido ? "▾" : "▸"}
          </span>
          <span className="font-mono font-semibold text-orange-600 dark:text-orange-500">
            {pedido.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">{pedido.clienteNombre ?? "Invitado"}</span>
          <span>{formatoFecha(pedido.created_at)}</span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {pedido.itemsCount} {pedido.itemsCount === 1 ? "item" : "items"}
          </span>
          <span>{formatoPrecio.format(pedido.total)}</span>
          <div
            className={`inline-flex w-fit items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 ${estadoInfo.pill}`}
            onClick={(e) => e.stopPropagation()}
          >
            <select
              value={estado}
              disabled={guardandoEstado}
              onChange={(e) => actualizarEstado(e.target.value as EstadoPedido)}
              className="cursor-pointer appearance-none border-none bg-transparent p-0 text-xs font-semibold uppercase tracking-widest outline-none disabled:cursor-wait"
            >
              {ESTADOS.map((e) => (
                <option key={e.valor} value={e.valor} className="text-black">
                  {e.label}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="text-sm leading-none">▾</span>
          </div>
        </div>
      </div>

      {expandido && (
        <div className="border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className={etiquetaClase}>Artículos</h3>

                {cargandoItems && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>
                )}
                {errorItems && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errorItems}</p>
                )}

                {!cargandoItems && !errorItems && (
                  <table className="w-full text-sm">
                    <tbody>
                      {items.length === 0 && (
                        <tr>
                          <td className="py-2 text-zinc-600 dark:text-zinc-400">
                            Sin productos.
                          </td>
                        </tr>
                      )}
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-black/8 dark:border-white/[.145]"
                        >
                          <td className="py-2 pr-2">
                            {item.productoNombre}
                            {(item.talla || item.color) && (
                              <span className="ml-2 text-xs text-zinc-500">
                                {[item.talla, item.color].filter(Boolean).join(" · ")}
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-2 text-zinc-600 dark:text-zinc-400">
                            ×{item.cantidad}
                          </td>
                          <td className="py-2 text-right">
                            {formatoPrecio.format(item.precioUnitario * item.cantidad)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={imprimirBoleta}
                  disabled={cargandoItems}
                  className="w-fit bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  Imprimir boleta
                </button>

                <button
                  type="button"
                  onClick={imprimirEtiqueta}
                  disabled={cargandoEtiqueta || !pedido.numero_seguimiento}
                  className="w-fit border border-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-black hover:bg-black/5 disabled:opacity-50 dark:border-white dark:text-white dark:hover:bg-white/10"
                >
                  {cargandoEtiqueta ? "Cargando..." : "Imprimir etiqueta"}
                </button>
              </div>
            </div>

            <div className="max-w-xs">
              {!pedido.numero_seguimiento && (
                <button
                  type="button"
                  onClick={generarEnvio}
                  disabled={generandoEnvio || cargandoItems || items.length === 0}
                  className="w-fit bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {generandoEnvio ? "Generando..." : "Generar envío con Chilexpress"}
                </button>
              )}

              {errorGenerarEnvio && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorGenerarEnvio}</p>
              )}

              <div className="mt-4">
                <label className={etiquetaClase}>Número de envío</label>
                <input
                  type="text"
                  value={seguimiento}
                  onChange={(e) => setSeguimiento(e.target.value)}
                  onBlur={guardarSeguimiento}
                  disabled={guardandoSeguimiento || !!pedido.numero_seguimiento}
                  placeholder="Sin asignar"
                  className={`${campoClase} disabled:opacity-60`}
                />
              </div>

              {pedido.numero_seguimiento && (
                <button
                  type="button"
                  onClick={consultarEstadoEnvio}
                  disabled={cargandoEstadoEnvio}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:opacity-70 disabled:opacity-50 dark:text-blue-400"
                >
                  {cargandoEstadoEnvio ? "Consultando..." : "Ver estado"}
                </button>
              )}

              {errorEstadoEnvio && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorEstadoEnvio}</p>
              )}

              {estadoEnvio && (
                <div className="mt-1 rounded-md border border-black/8 p-2 text-xs dark:border-white/[.145]">
                  <p className="font-semibold">{estadoEnvio.estado}</p>
                  <p className="text-zinc-500">{estadoEnvio.ubicacionEstado}</p>
                  {estadoEnvio.eventos.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {estadoEnvio.eventos.map((evento, i) => (
                        <li key={i} className="text-zinc-600 dark:text-zinc-400">
                          {evento.fecha} {evento.hora} — {evento.descripcion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
