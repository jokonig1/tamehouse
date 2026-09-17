"use client";

import type { ChangeEvent } from "react";

interface PrecioInputProps {
  value: string;
  onChange: (value: string) => void;
  className: string;
  // "$" por defecto (uso original: precios). Pasa null para números
  // sin símbolo (ej. usos máximos) o cambia el sufijo para "%", etc.
  prefijo?: string | null;
  sufijo?: string;
}

export default function PrecioInput({
  value,
  onChange,
  className,
  prefijo = "$",
  sufijo,
}: PrecioInputProps) {
  const formateado = value ? Number(value).toLocaleString("es-CL") : "";

  function manejarCambio(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.replace(/\D/g, ""));
  }

  return (
    <div className="flex items-center gap-2">
      {prefijo && <span className="text-sm text-zinc-500">{prefijo}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={formateado}
        onChange={manejarCambio}
        className={className}
      />
      {sufijo && <span className="text-sm text-zinc-500">{sufijo}</span>}
    </div>
  );
}
