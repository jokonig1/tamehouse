import { NextResponse } from "next/server";
import { getOficinasPorComuna } from "@/lib/chilexpress";

export async function GET(request: Request) {
  const countyName = new URL(request.url).searchParams.get("comuna");

  if (!countyName || !countyName.trim()) {
    return NextResponse.json({ error: "Falta la comuna." }, { status: 400 });
  }

  try {
    const oficinas = await getOficinasPorComuna(countyName);
    return NextResponse.json({ oficinas });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudieron buscar sucursales." },
      { status: 502 }
    );
  }
}
