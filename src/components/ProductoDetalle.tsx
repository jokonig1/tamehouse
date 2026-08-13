"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Producto, Variante } from "@/lib/types";
import { useCart } from "@/lib/cart";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

const ORDEN_TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

const COLORES: Record<string, string> = {
  negro: "#171717",
  blanco: "#f5f5f5",
  gris: "#71717a",
  rojo: "#ef4444",
  azul: "#3b82f6",
  verde: "#22c55e",
  amarillo: "#eab308",
  beige: "#d6cbb0",
  cafe: "#78350f",
  café: "#78350f",
  rosado: "#f472b6",
  rosa: "#f472b6",
};

export default function ProductoDetalle({
  producto,
  variantes,
}: {
  producto: Producto;
  variantes: Variante[];
}) {
  const colores = useMemo(
    () => Array.from(new Set(variantes.map((v) => v.color).filter((c): c is string => !!c))),
    [variantes]
  );
  const tallas = useMemo(() => {
    const disponibles = Array.from(
      new Set(variantes.map((v) => v.talla).filter((t): t is string => !!t))
    );
    return disponibles.sort((a, b) => {
      const ia = ORDEN_TALLAS.indexOf(a);
      const ib = ORDEN_TALLAS.indexOf(b);
      if (ia === -1 || ib === -1) return a.localeCompare(b);
      return ia - ib;
    });
  }, [variantes]);

  const [color, setColor] = useState(colores[0] ?? null);
  const [talla, setTalla] = useState(tallas[0] ?? null);
  const [cantidad, setCantidad] = useState(1);

  const { addItem } = useCart();
  const router = useRouter();

  const tieneVariantes = variantes.length > 0;
  const varianteActual = variantes.find((v) => v.color === color && v.talla === talla);
  const stockDisponible = tieneVariantes ? (varianteActual?.stock ?? 0) : null;
  const disponible = tieneVariantes ? !!varianteActual && (stockDisponible ?? 0) > 0 : true;

  function tallaDisponible(t: string) {
    const variante = variantes.find((v) => v.color === color && v.talla === t);
    return (variante?.stock ?? 0) > 0;
  }

  function itemParaCarrito() {
    return {
      id: varianteActual?.id ?? producto.id,
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talla,
      color,
    };
  }

  function agregarAlCarrito() {
    addItem(itemParaCarrito(), cantidad);
    router.push("/carrito");
  }

  function comprarAhora() {
    addItem(itemParaCarrito(), cantidad);
    router.push("/checkout");
  }

  const claseBoton =
    "flex h-11 items-center justify-center rounded-md border border-black bg-white text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/20 disabled:text-black/30 disabled:hover:bg-white";

  return (
    <div className="flex flex-col gap-5">
      <div>
        {producto.categoria && (
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-black">
            {producto.categoria}
          </span>
        )}
        <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-tight text-black sm:text-4xl">
          {producto.nombre}
        </h1>
        <p className="mt-2 text-xl font-semibold text-black">
          {formatoPrecio.format(producto.precio)}
        </p>
      </div>

      {producto.descripcion && (
        <p className="max-w-md text-sm text-black">{producto.descripcion}</p>
      )}

      {colores.length > 0 && (
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-black">Color</h2>
          <div className="mt-2 flex gap-3">
            {colores.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                title={c}
                className={`h-8 w-8 rounded-full border-2 transition-colors ${
                  color === c ? "border-black" : "border-transparent"
                }`}
              >
                <span
                  className="block h-full w-full rounded-full border border-black/10"
                  style={{ backgroundColor: COLORES[c.toLowerCase()] ?? "#a1a1aa" }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {tallas.length > 0 && (
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-black">Talla</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tallas.map((t) => {
              const disponible = tallaDisponible(t);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!disponible}
                  onClick={() => setTalla(t)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    !disponible
                      ? "cursor-not-allowed border-black/10 text-black/30 line-through"
                      : talla === t
                        ? "border-black bg-black text-white"
                        : "border-black/20 text-black hover:border-black/50"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-black">Cantidad</h2>
        <div className="mt-2 flex h-10 w-fit items-center rounded-md border border-black/20">
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.max(1, n - 1))}
            className="flex h-full w-10 items-center justify-center text-lg text-black hover:opacity-70"
            aria-label="Restar"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium text-black">{cantidad}</span>
          <button
            type="button"
            onClick={() =>
              setCantidad((n) => (stockDisponible !== null ? Math.min(stockDisponible || n, n + 1) : n + 1))
            }
            className="flex h-full w-10 items-center justify-center text-lg text-black hover:opacity-70"
            aria-label="Sumar"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button type="button" disabled={!disponible} onClick={agregarAlCarrito} className={claseBoton}>
          Añadir al carrito
        </button>
        <button type="button" disabled={!disponible} onClick={comprarAhora} className={claseBoton}>
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
