import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const LIMITE_INTENTOS_EMAIL = 5;
const LIMITE_INTENTOS_IP = 20;
const VENTANA_MINUTOS = 15;
const RETENCION_DIAS = 3;
const PROBABILIDAD_LIMPIEZA = 0.05;

function obtenerIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
  }

  const emailNormalizado = email.trim().toLowerCase();
  const ip = obtenerIp(request);
  const desde = new Date(Date.now() - VENTANA_MINUTOS * 60 * 1000).toISOString();
  const supabaseAdmin = getSupabaseAdmin();

  const [{ count: intentosEmail }, { count: intentosIp }] = await Promise.all([
    supabaseAdmin
      .from("intentos_login")
      .select("id", { count: "exact", head: true })
      .eq("email", emailNormalizado)
      .eq("exitoso", false)
      .gte("creado_en", desde),
    supabaseAdmin
      .from("intentos_login")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("exitoso", false)
      .gte("creado_en", desde),
  ]);

  if ((intentosEmail ?? 0) >= LIMITE_INTENTOS_EMAIL || (intentosIp ?? 0) >= LIMITE_INTENTOS_IP) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá unos minutos y volvé a intentar." },
      { status: 429 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (lista) =>
          lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailNormalizado,
    password,
  });

  if (error || !data.user) {
    // Solo se guardan los intentos fallidos -- son los unicos que usa
    // el conteo de arriba. Loguear tambien los exitosos solo llenaria
    // la tabla sin necesidad.
    await supabaseAdmin.from("intentos_login").insert({ email: emailNormalizado, ip, exitoso: false });

    // Limpieza oportunista: nadie necesita filas mas viejas que la
    // ventana de retencion, asi la tabla nunca crece sin control.
    if (Math.random() < PROBABILIDAD_LIMPIEZA) {
      const limite = new Date(Date.now() - RETENCION_DIAS * 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin.from("intentos_login").delete().lt("creado_en", limite);
    }

    return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json({ rol: perfil?.rol ?? "cliente" });
}
