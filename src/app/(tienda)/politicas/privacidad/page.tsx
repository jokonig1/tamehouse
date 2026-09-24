import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <span className="text-xs font-medium tracking-[0.3em] text-zinc-400 uppercase">
          Políticas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Política de privacidad
        </h1>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700">
          <p>
            En Tamehouse respetamos tu privacidad. Acá te contamos qué datos recopilamos, para
            qué los usamos y cómo los protegemos.
          </p>

          <div>
            <h2 className="text-base font-semibold text-black">¿Qué datos recopilamos?</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>• Datos de tu cuenta: nombre, correo electrónico y teléfono.</li>
              <li>
                • Datos de despacho: dirección, comuna, región y datos de contacto del
                destinatario, para poder enviarte tu pedido.
              </li>
              <li>• Historial de tus pedidos y productos comprados.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Datos de pago</h2>
            <p className="mt-3">
              <strong className="text-black">Nunca almacenamos los datos de tu tarjeta.</strong>{" "}
              El pago se procesa directamente a través de Getnet, nuestro proveedor de pagos; no
              tenemos acceso ni guardamos el número de tarjeta, CVV u otra información sensible
              de pago.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Para qué usamos tus datos?</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>• Procesar y despachar tus pedidos, y coordinar el envío con Chilexpress.</li>
              <li>• Darte acceso a tu cuenta y a tu historial de compras.</li>
              <li>• Responder tus consultas de contacto.</li>
              <li>
                • Enviarte novedades y ofertas por correo, solo si aceptaste recibirlas al
                comprar.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Con quién compartimos tus datos?</h2>
            <p className="mt-3">
              Solo con los proveedores que necesitamos para operar la tienda:{" "}
              <strong className="text-black">Getnet</strong> (procesamiento de pagos),{" "}
              <strong className="text-black">Chilexpress</strong> (envío de tus pedidos) y{" "}
              <strong className="text-black">Supabase</strong> (almacenamiento seguro de la base
              de datos). No vendemos ni compartimos tus datos con terceros para fines
              publicitarios.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Tus derechos</h2>
            <p className="mt-3">
              Puedes revisar y actualizar tus datos de contacto en cualquier momento desde{" "}
              <Link href="/mi-cuenta" className="underline hover:opacity-70">
                Mi cuenta
              </Link>
              . Si quieres solicitar la eliminación de tu cuenta y tus datos, escríbenos a{" "}
              <a href="mailto:contacto@tamehouse.cl" className="underline hover:opacity-70">
                contacto@tamehouse.cl
              </a>
              .
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-10 inline-block text-sm font-medium underline hover:opacity-70"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
