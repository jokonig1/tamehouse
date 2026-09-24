import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <span className="text-xs font-medium tracking-[0.3em] text-zinc-400 uppercase">
          Políticas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Términos del servicio
        </h1>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700">
          <p>
            Al usar Tamehouse y comprar en esta tienda, aceptas los siguientes términos. Te
            recomendamos leerlos junto con nuestra{" "}
            <Link href="/politicas/devoluciones" className="underline hover:opacity-70">
              política de devoluciones
            </Link>
            ,{" "}
            <Link href="/politicas/envios" className="underline hover:opacity-70">
              política de envíos
            </Link>{" "}
            y{" "}
            <Link href="/politicas/privacidad" className="underline hover:opacity-70">
              política de privacidad
            </Link>
            .
          </p>

          <div>
            <h2 className="text-base font-semibold text-black">Tu cuenta</h2>
            <p className="mt-3">
              Eres responsable de mantener tu contraseña segura y de la actividad que ocurra en
              tu cuenta. Si notas un uso no autorizado, avísanos de inmediato a{" "}
              <a href="mailto:contacto@tamehouse.cl" className="underline hover:opacity-70">
                contacto@tamehouse.cl
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Precios y disponibilidad</h2>
            <p className="mt-3">
              Los precios se muestran en pesos chilenos (CLP) e incluyen IVA. Podemos actualizar
              precios y stock sin previo aviso; el precio válido es el que se muestra al momento
              de confirmar tu compra. Si un producto se agota después de que hiciste el pedido,
              te contactaremos para ofrecerte un cambio o la devolución de tu dinero.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Pago</h2>
            <p className="mt-3">
              Los pagos se procesan de forma segura a través de Getnet. No almacenamos datos de
              tu tarjeta en ningún momento.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Propiedad intelectual</h2>
            <p className="mt-3">
              El nombre Tamehouse, los diseños, logos e imágenes de este sitio son propiedad del
              artista y no pueden reproducirse ni usarse comercialmente sin autorización.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Cambios a estos términos</h2>
            <p className="mt-3">
              Podemos actualizar estos términos en cualquier momento. Los cambios rigen desde que
              se publican en esta página.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">Ley aplicable</h2>
            <p className="mt-3">
              Estos términos se rigen por las leyes de Chile, incluyendo la Ley N.º 19.496 sobre
              Protección de los Derechos de los Consumidores.
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
