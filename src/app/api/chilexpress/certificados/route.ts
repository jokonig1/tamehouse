import { NextResponse } from "next/server";
import { cerrarCertificado, generarCertificado } from "@/lib/chilexpress";

export async function POST(request: Request) {
  const customerCardNumber = new URL(request.url).searchParams.get("tcc") ?? undefined;

  try {
    const certificateNumber = await generarCertificado(customerCardNumber);
    return NextResponse.json({ certificateNumber });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo generar el certificado." },
      { status: 502 }
    );
  }
}

function parseCierre(valor: unknown): Parameters<typeof cerrarCertificado>[0] | null {
  if (!valor || typeof valor !== "object") return null;
  const { certificateNumber, certificateType, dropNumber } = valor as Record<string, unknown>;

  if (typeof certificateNumber !== "number" || typeof certificateType !== "number") {
    return null;
  }

  return {
    certificateNumber,
    certificateType,
    dropNumber: typeof dropNumber === "number" ? dropNumber : undefined,
  };
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const datos = parseCierre(body);
  if (!datos) {
    return NextResponse.json(
      { error: "Faltan o están mal formados certificateNumber o certificateType." },
      { status: 400 }
    );
  }

  try {
    const cerrado = await cerrarCertificado(datos);
    return NextResponse.json(cerrado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo cerrar el certificado." },
      { status: 502 }
    );
  }
}
