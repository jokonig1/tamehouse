import { NextResponse } from "next/server";
import { consultarEnvio } from "@/lib/chilexpress";

function parseConsulta(valor: unknown): Parameters<typeof consultarEnvio>[0] | null {
  if (!valor || typeof valor !== "object") return null;
  const { transportOrderNumber, reference, rut } = valor as Record<string, unknown>;

  if (
    typeof transportOrderNumber !== "number" &&
    typeof reference !== "string" &&
    typeof rut !== "number"
  ) {
    return null;
  }

  return {
    transportOrderNumber: typeof transportOrderNumber === "number" ? transportOrderNumber : undefined,
    reference: typeof reference === "string" ? reference : undefined,
    rut: typeof rut === "number" ? rut : undefined,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const consulta = parseConsulta(body);
  if (!consulta) {
    return NextResponse.json(
      { error: "Debes enviar al menos transportOrderNumber, reference o rut." },
      { status: 400 }
    );
  }

  try {
    const estado = await consultarEnvio(consulta);
    return NextResponse.json(estado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo consultar el envío." },
      { status: 502 }
    );
  }
}
