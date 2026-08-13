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
  productos: { nombre: string } | null;
}

interface PedidoItemConsulta {
  id: string;
  cantidad: number;
  precio_unitario: number;
  variantes: VarianteEmbebida | null;
}

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
        className="grid cursor-pointer grid-cols-[1.5rem_1fr_1fr_1fr_0.7fr_1fr_1fr] items-center gap-6 px-4 py-4 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
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

      {expandido && (
        <div className="border-t border-black/8 bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-900">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className={etiquetaClase}>Artículos</h3>

              {cargandoItems && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando...</p>
              )}
              {errorItems && <p className="text-sm text-red-600 dark:text-red-400">{errorItems}</p>}

              {!cargandoItems && !errorItems && (
                <table className="w-full text-sm">
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td className="py-2 text-zinc-600 dark:text-zinc-400">Sin productos.</td>
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

            <div className="space-y-6">
              <div>
                <p className={etiquetaClase}>Dirección de envío</p>
                <p className="text-sm">
                  {pedido.direccion ?? "-"}
                  {pedido.comuna ? `, ${pedido.comuna}` : ""}
                </p>
              </div>

              <div className="max-w-xs">
                <label className={etiquetaClase}>Número de envío</label>
                <input
                  type="text"
                  value={seguimiento}
                  onChange={(e) => setSeguimiento(e.target.value)}
                  onBlur={guardarSeguimiento}
                  disabled={guardandoSeguimiento}
                  placeholder="Sin asignar"
                  className={campoClase}
                />
              </div>

              <button
                type="button"
                onClick={imprimirBoleta}
                disabled={cargandoItems}
                className="bg-black px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-70 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                Imprimir boleta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
