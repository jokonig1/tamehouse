"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  talla: string | null;
  color: string | null;
  stockMaximo: number | null;
  cantidad: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "cantidad">, cantidad: number) => void;
  removeItem: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tamehouse-carrito";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del carrito desde localStorage al montar
        setItems(JSON.parse(guardado));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (cargado) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, cargado]);

  function addItem(item: Omit<CartItem, "cantidad">, cantidad: number) {
    setItems((prev) => {
      const existente = prev.find((i) => i.id === item.id);
      if (existente) {
        const tope = existente.stockMaximo ?? Infinity;
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: Math.min(tope, i.cantidad + cantidad) } : i
        );
      }
      const tope = item.stockMaximo ?? Infinity;
      return [...prev, { ...item, cantidad: Math.min(tope, cantidad) }];
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateCantidad(id: string, cantidad: number) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const tope = i.stockMaximo ?? Infinity;
        return { ...i, cantidad: Math.min(tope, Math.max(1, cantidad)) };
      })
    );
  }

  const subtotal = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateCantidad, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
