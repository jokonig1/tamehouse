import { NextResponse } from "next/server";
import { cotizarEnvio } from "@/lib/chilexpress";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { destinationCountyCode, pesoKg, altoCm, anchoCm, largoCm, valorDeclarado } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof destinationCountyCode !== "string" || !destinationCountyCode.trim()) {
    return NextResponse.json({ error: "Falta la comuna de destino." }, { status: 400 });
  }

  try {
    const opciones = await cotizarEnvio(destinationCountyCode, {
      pesoKg: Number(pesoKg) || 1,
      altoCm: Number(altoCm) || 10,
      anchoCm: Number(anchoCm) || 10,
      largoCm: Number(largoCm) || 10,
      valorDeclarado: Number(valorDeclarado) || 1,
    });
    return NextResponse.json({ opciones });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo cotizar el envío." },
      { status: 502 }
    );
  }
}
