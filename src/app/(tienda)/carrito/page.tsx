"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export default function Page() {
  const { items, removeItem, updateCantidad, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 bg-white text-black">
        <p className="text-zinc-500">Tu carrito está vacío.</p>
        <Link href="/" className="text-sm font-medium underline hover:opacity-70">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <span className="text-xs font-medium uppercase tracking-[0.3em] text-red-500">
          Tu selección
        </span>
        <h1 className="mt-2 text-5xl font-extrabold uppercase tracking-tight sm:text-6xl">
          Carrito
        </h1>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-black/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-6 py-6">
                <div className="h-24 w-20 shrink-0 rounded-md bg-zinc-100" />

                <div className="flex-1">
                  <p className="font-semibold">{item.nombre}</p>
                  {(item.talla || item.color) && (
                    <p className="mt-1 text-sm text-zinc-500">
                      {[item.talla ? `Talla ${item.talla}` : null, item.color]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <div className="mt-3 flex h-9 w-fit items-center rounded-md border border-black/20">
                    <button
                      type="button"
                      onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                      className="flex h-full w-9 items-center justify-center hover:opacity-70"
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                      className="flex h-full w-9 items-center justify-center hover:opacity-70"
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-medium text-amber-600">
                    {formatoPrecio.format(item.precio * item.cantidad)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-zinc-500 underline hover:text-black"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-lg bg-zinc-50 p-6">
            <div className="flex items-center justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>{formatoPrecio.format(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">El envío se calcula en el checkout.</p>

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-lg font-semibold">
              <span>Total</span>
              <span>{formatoPrecio.format(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex h-12 items-center justify-center rounded-md bg-red-600 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-red-500"
            >
              Finalizar compra
            </Link>
            <Link
              href="/"
              className="mt-3 flex items-center justify-center text-sm font-medium uppercase tracking-widest text-zinc-500 hover:text-black"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
