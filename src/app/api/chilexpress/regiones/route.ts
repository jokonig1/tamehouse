import { NextResponse } from "next/server";
import { getRegiones } from "@/lib/chilexpress";

export async function GET() {
  try {
    const regiones = await getRegiones();
    return NextResponse.json({ regiones });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudieron consultar las regiones." },
      { status: 502 }
    );
  }
}
