import { NextResponse } from "next/server";
import {
  crearOrdenTransporte,
  type ContactoDestinatario,
  type DatosOrdenTransporte,
  type DireccionDestino,
} from "@/lib/chilexpress";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function parseDestino(valor: unknown): DireccionDestino | null {
  if (!valor || typeof valor !== "object") return null;
  const { countyCoverageCode, streetName, streetNumber, supplement } = valor as Record<
    string,
    unknown
  >;

  if (
    typeof countyCoverageCode !== "string" ||
    typeof streetName !== "string" ||
    typeof streetNumber !== "number"
  ) {
    return null;
  }

  return {
    countyCoverageCode,
    streetName,
    streetNumber,
    supplement: typeof supplement === "string" ? supplement : undefined,
  };
}

function parseDestinatario(valor: unknown): ContactoDestinatario | null {
  if (!valor || typeof valor !== "object") return null;
  const { nombre, telefono, email } = valor as Record<string, unknown>;

  if (typeof nombre !== "string" || typeof telefono !== "string" || typeof email !== "string") {
    return null;
  }

  return { nombre, telefono, email };
}

function parseRetiroEnOficina(valor: unknown): DatosOrdenTransporte["retiroEnOficina"] | undefined {
  if (!valor || typeof valor !== "object") return undefined;
  const { officeCode } = valor as Record<string, unknown>;
  if (typeof officeCode !== "number") return undefined;
  return { officeCode };
}

function parsePaquete(valor: unknown): DatosOrdenTransporte["paquete"] | null {
  if (!valor || typeof valor !== "object") return null;
  const { pesoKg, altoCm, anchoCm, largoCm, valorDeclarado, servicioTypeCode } = valor as Record<
    string,
    unknown
  >;

  if (
    typeof pesoKg !== "number" ||
    typeof altoCm !== "number" ||
    typeof anchoCm !== "number" ||
    typeof largoCm !== "number" ||
    typeof valorDeclarado !== "number" ||
    typeof servicioTypeCode !== "number"
  ) {
    return null;
  }

  return { pesoKg, altoCm, anchoCm, largoCm, valorDeclarado, servicioTypeCode };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { pedidoId } = (body ?? {}) as Record<string, unknown>;
  if (typeof pedidoId !== "string" || !pedidoId.trim()) {
    return NextResponse.json({ error: "Falta el id del pedido." }, { status: 400 });
  }

  const {
    destino: destinoRaw,
    destinatario: destinatarioRaw,
    paquete: paqueteRaw,
    retiroEnOficina: retiroRaw,
  } = body as Record<string, unknown>;
  const destino = parseDestino(destinoRaw);
  const destinatario = parseDestinatario(destinatarioRaw);
  const paquete = parsePaquete(paqueteRaw);
  const retiroEnOficina = parseRetiroEnOficina(retiroRaw);

  if (!destino || !destinatario || !paquete) {
    return NextResponse.json(
      { error: "Faltan o están mal formados los datos de destino, destinatario o paquete." },
      { status: 400 }
    );
  }

  try {
    const orden = await crearOrdenTransporte({
      referencia: pedidoId,
      destino,
      destinatario,
      paquete,
      retiroEnOficina,
    });

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from("pedidos")
      .update({
        numero_seguimiento: orden.numeroSeguimiento,
        etiqueta_chilexpress: orden.etiquetaBase64,
      })
      .eq("id", pedidoId);

    if (error) {
      return NextResponse.json(
        { error: `El envío se generó pero no se pudo guardar en el pedido: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(orden);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo generar el envío." },
      { status: 502 }
    );
  }
}
