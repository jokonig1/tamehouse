"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const REGIONES = [
  "Metropolitana de Santiago",
  "Valparaíso",
  "Biobío",
  "Coquimbo",
  "Araucanía",
  "Los Lagos",
  "Maule",
  "O'Higgins",
];

const TARJETAS = ["VISA", "Mastercard", "AMEX", "Diners"];

const inputClass =
  "h-12 w-full rounded-md border border-black/15 bg-white px-4 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/40";

export default function Page() {
  const { items, subtotal } = useCart();
  const [entrega, setEntrega] = useState<"envio" | "retiro">("envio");

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-4 bg-white text-black">
        <p className="text-black/60">Tu carrito está vacío.</p>
        <Link href="/" className="text-sm font-medium underline hover:opacity-70">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-6rem)] w-full bg-white text-black lg:grid-cols-2">
      <div className="border-b border-black/10 px-6 py-10 sm:px-12 lg:border-b-0 lg:border-r">
        <div className="mx-auto flex max-w-md flex-col gap-8">
          <div>
            <h2 className="text-lg font-semibold">Contacto</h2>
            <input type="email" placeholder="Correo electrónico" className={`${inputClass} mt-3`} />
            <label className="mt-3 flex items-center gap-2 text-sm text-black/70">
              <input type="checkbox" className="h-4 w-4" />
              Enviarme novedades y ofertas por correo electrónico
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Entrega</h2>

            <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-black/15">
              <button
                type="button"
                onClick={() => setEntrega("envio")}
                className={`h-11 text-sm font-medium ${entrega === "envio" ? "bg-black text-white" : "bg-white text-black/60 hover:bg-black/5"}`}
              >
                Envío
              </button>
              <button
                type="button"
                onClick={() => setEntrega("retiro")}
                className={`h-11 border-l border-black/15 text-sm font-medium ${entrega === "retiro" ? "bg-black text-white" : "bg-white text-black/60 hover:bg-black/5"}`}
              >
                Retiro
              </button>
            </div>

            {entrega === "envio" && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Nombre" className={inputClass} />
                  <input placeholder="Apellidos" className={inputClass} />
                </div>
                <input placeholder="Dirección" className={inputClass} />
                <input placeholder="Casa, departamento, etc. (opcional)" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <select className={inputClass} defaultValue="">
                    <option value="" disabled>
                      Región
                    </option>
                    {REGIONES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input placeholder="Comuna" className={inputClass} />
                </div>
                <input type="tel" placeholder="Teléfono" className={inputClass} />
                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input type="checkbox" className="h-4 w-4" />
                  Guardar mi información y consultar más rápidamente la próxima vez
                </label>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold">Métodos de envío</h2>
            <div className="mt-3 rounded-md bg-black/5 p-4 text-sm text-black/60">
              Ingresa tu dirección de envío para ver los métodos disponibles.
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Pago</h2>
            <p className="text-sm text-black/50">
              Todas las transacciones son seguras y están encriptadas.
            </p>

            <div className="mt-3 rounded-md border border-black bg-black/[.02] p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="radio" name="pago" checked readOnly className="h-4 w-4" />
                  Tarjeta de crédito
                </label>
                <div className="flex gap-1.5">
                  {TARJETAS.map((t) => (
                    <span
                      key={t}
                      className="flex h-6 items-center rounded border border-black/10 bg-white px-2 text-[10px] font-semibold text-black/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <input placeholder="Número de tarjeta" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Fecha de vencimiento (MM / AA)" className={inputClass} />
                  <input placeholder="Código de seguridad" className={inputClass} />
                </div>
                <input placeholder="Nombre del titular" className={inputClass} />
                <div className="grid grid-cols-[100px_1fr] gap-3">
                  <select className={inputClass} defaultValue="RUT">
                    <option value="RUT">RUT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                  <input placeholder="Número de documento" className={inputClass} />
                </div>
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>
                    Cuotas
                  </option>
                  <option value="1">1 cuota sin interés</option>
                  <option value="3">3 cuotas</option>
                  <option value="6">6 cuotas</option>
                  <option value="12">12 cuotas</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex h-12 items-center justify-center rounded-md bg-black text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black/80"
          >
            Pagar {formatoPrecio.format(subtotal)}
          </button>
        </div>
      </div>

      <div className="bg-zinc-50 px-6 py-10 sm:px-12">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-14 shrink-0 rounded-md bg-black/5">
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                    {item.cantidad}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.nombre}</p>
                  {(item.talla || item.color) && (
                    <p className="text-xs text-black/50">
                      {[item.talla ? `Talla ${item.talla}` : null, item.color]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {formatoPrecio.format(item.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <input
              placeholder="Código de descuento"
              className={`${inputClass} bg-white`}
            />
            <button
              type="button"
              className="rounded-md border border-black/15 px-5 text-sm font-medium text-black/60 hover:bg-black/5"
            >
              Aplicar
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-black/10 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/60">Subtotal</span>
              <span>{formatoPrecio.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/60">Envío</span>
              <span className="text-black/60">Introducir la dirección de envío</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>
              <span className="mr-1 text-xs font-normal text-black/40">CLP</span>
              {formatoPrecio.format(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
