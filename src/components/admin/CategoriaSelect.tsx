"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const NUEVA_CATEGORIA = "__nueva__";

interface CategoriaSelectProps {
  value: string;
  onChange: (value: string) => void;
  className: string;
}

export default function CategoriaSelect({ value, onChange, className }: CategoriaSelectProps) {
  const [categorias, setCategorias] = useState<string[]>([]);
  const [modoNueva, setModoNueva] = useState(false);

  useEffect(() => {
    async function cargarCategorias() {
      const { data } = await supabase.from("productos").select("categoria");
      const unicas = Array.from(
        new Set(
          (data ?? [])
            .map((p) => p.categoria as string | null)
            .filter((c): c is string => Boolean(c && c.trim()))
        )
      ).sort((a, b) => a.localeCompare(b));
      setCategorias(unicas);
    }
    cargarCategorias();
  }, []);

  if (modoNueva) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          placeholder="Nombre de la categoría"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
        <button
          type="button"
          onClick={() => {
            setModoNueva(false);
            onChange("");
          }}
          aria-label="Cancelar nueva categoría"
          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === NUEVA_CATEGORIA) {
          setModoNueva(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className={`${className} text-zinc-900 dark:text-zinc-100`}
    >
      <option value="">Sin categoría</option>
      {Array.from(new Set(value ? [value, ...categorias] : categorias)).map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={NUEVA_CATEGORIA}>+ Nueva categoría</option>
    </select>
  );
}
