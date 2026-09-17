import { NextResponse } from "next/server";
import { consultarCertificado } from "@/lib/chilexpress";

export async function GET(_request: Request, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;

  try {
    const certificado = await consultarCertificado(numero);
    return NextResponse.json(certificado);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo consultar el certificado." },
      { status: 502 }
    );
  }
}
