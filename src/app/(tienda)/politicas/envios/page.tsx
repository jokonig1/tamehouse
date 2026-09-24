import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <span className="text-xs font-medium tracking-[0.3em] text-zinc-400 uppercase">
          Políticas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Política de envíos
        </h1>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700">
          <p>
            Hacemos envíos a todo Chile a través de{" "}
            <strong className="text-black">Chilexpress</strong>. Puedes elegir entre despacho a
            domicilio o retiro en una sucursal Chilexpress cercana a ti.
          </p>

          <div>
            <h2 className="text-base font-semibold text-black">Costo del envío</h2>
            <p className="mt-3">
              El costo se calcula en el checkout según tu región, comuna y la opción de envío que
              elijas. No cobramos ningún monto adicional fuera de lo que cotiza Chilexpress —
              vas a ver el valor exacto antes de pagar.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Tiempo de entrega</h2>
            <p className="mt-3">
              El tiempo estimado depende de tu comuna de destino y se muestra junto con el costo
              al cotizar en el checkout. Puede variar en fechas con alta demanda (por ejemplo,
              antes de un show o lanzamiento).
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Seguimiento de tu pedido</h2>
            <p className="mt-3">
              Una vez que despachamos tu pedido, te asignamos un número de seguimiento que puedes
              revisar en cualquier momento desde{" "}
              <Link href="/mi-cuenta/pedidos" className="underline hover:opacity-70">
                Mi cuenta → Mis pedidos
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Tienes dudas sobre tu envío?</h2>
            <p className="mt-3">
              Escríbenos a{" "}
              <a href="mailto:contacto@tamehouse.cl" className="underline hover:opacity-70">
                contacto@tamehouse.cl
              </a>{" "}
              con tu número de pedido y te ayudamos.
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
