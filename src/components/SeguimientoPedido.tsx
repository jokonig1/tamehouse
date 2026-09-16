const ORDEN_ESTADOS = ["pagado", "preparando", "despachado", "entregado"];

const PASOS = [
  { clave: "realizado", label: "Pedido realizado", umbral: 0 },
  { clave: "pagado", label: "Pago confirmado", umbral: 0 },
  { clave: "preparando", label: "Preparando tu pedido", umbral: 1 },
  { clave: "despachado", label: "Pedido despachado", umbral: 2 },
  { clave: "entregado", label: "Pedido entregado", umbral: 3 },
];

const MENSAJES: Record<string, string> = {
  pagado: "¡Listo! Tu pago fue confirmado y ya estamos preparando tu pedido.",
  preparando: "Tu pedido se está preparando para el envío.",
  despachado: "Tu pedido ya está en camino.",
  entregado: "Tu pedido fue entregado. ¡Gracias por tu compra!",
};

function formatoFechaHora(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IconoPaso({ completado }: { completado: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
        completado ? "border-black bg-black text-white" : "border-black/15 text-black/15"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function SeguimientoPedido({
  estado,
  fechaCreacion,
  numeroSeguimiento,
}: {
  estado: string;
  fechaCreacion: string;
  numeroSeguimiento: string | null;
}) {
  const indiceEstado = ORDEN_ESTADOS.indexOf(estado);
  const fecha = formatoFechaHora(fechaCreacion);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-4">
        <IconoPaso completado />
        <p className="text-sm text-black">
          {MENSAJES[estado] ?? "Estamos procesando tu pedido."}
        </p>
      </div>

      <ul className="flex flex-col">
        {PASOS.map((paso, i) => {
          const completado = indiceEstado >= paso.umbral;
          const esUltimo = i === PASOS.length - 1;
          return (
            <li key={paso.clave} className="flex gap-3">
              <div className="flex flex-col items-center">
                <IconoPaso completado={completado} />
                {!esUltimo && (
                  <span className={`w-px flex-1 ${completado ? "bg-black" : "bg-black/15"}`} />
                )}
              </div>
              <div className={`pb-6 ${completado ? "text-black" : "text-black/40"}`}>
                <p className="text-sm font-medium">{paso.label}</p>
                {(paso.clave === "realizado" || paso.clave === "pagado") && completado && (
                  <p className="text-xs text-zinc-500">{fecha}</p>
                )}
                {paso.clave === "despachado" && completado && numeroSeguimiento && (
                  <p className="text-xs text-zinc-500">N.º de seguimiento: {numeroSeguimiento}</p>
                )}
                {paso.clave === "despachado" && indiceEstado === 2 && !numeroSeguimiento && (
                  <p className="text-xs text-zinc-500">
                    El número de seguimiento va a estar disponible apenas se despache.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
