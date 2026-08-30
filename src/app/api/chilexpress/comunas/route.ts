import { NextResponse } from "next/server";
import { getCoberturaAreas } from "@/lib/chilexpress";

export async function GET(request: Request) {
  const regionCode = new URL(request.url).searchParams.get("region") ?? "RM";

  try {
    const areas = await getCoberturaAreas(regionCode);
    return NextResponse.json({ areas });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo consultar la cobertura." },
      { status: 502 }
    );
  }
}
