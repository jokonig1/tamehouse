"use client";

import type { ChangeEvent } from "react";

interface PrecioInputProps {
  value: string;
  onChange: (value: string) => void;
  className: string;
}

export default function PrecioInput({ value, onChange, className }: PrecioInputProps) {
  const formateado = value ? Number(value).toLocaleString("es-CL") : "";

  function manejarCambio(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ""));
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={formateado}
        onChange={manejarCambio}
        className={className}
      />
    </div>
  );
}
