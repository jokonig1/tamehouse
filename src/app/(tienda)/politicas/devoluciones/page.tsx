import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <span className="text-xs font-medium tracking-[0.3em] text-zinc-400 uppercase">
          Políticas
        </span>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">
          Política de devoluciones
        </h1>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700">
          <p>
            En Tamehouse queremos que estés conforme con tu compra. Si tu producto llegó con
            alguna falla, tienes <strong className="text-black">10 días corridos</strong> desde
            que recibiste el pedido para solicitar una devolución.
          </p>

          <div>
            <h2 className="text-base font-semibold text-black">¿Qué cubre esta política?</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li>• Productos con fallas de fabricación (costuras, estampado, materiales, etc.).</li>
              <li>• Errores nuestros, como el envío de un producto distinto al que compraste.</li>
              <li>• Productos que llegaron dañados durante el envío.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Qué no cubre?</h2>
            <p className="mt-3">
              No aceptamos devoluciones ni cambios por{" "}
              <strong className="text-black">elección incorrecta de talla</strong>. Te
              recomendamos revisar bien la guía de tallas antes de comprar; si tienes dudas,
              puedes escribirnos antes de realizar tu pedido.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Qué recibo si mi devolución es aceptada?</h2>
            <p className="mt-3">
              Puedes elegir entre el <strong className="text-black">cambio por el mismo producto</strong>{" "}
              (sujeto a disponibilidad de stock) o la{" "}
              <strong className="text-black">devolución de tu dinero</strong> al medio de pago
              original.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">¿Cómo lo solicito?</h2>
            <p className="mt-3">
              Escríbenos a{" "}
              <a href="mailto:contacto@tamehouse.cl" className="underline hover:opacity-70">
                contacto@tamehouse.cl
              </a>{" "}
              con tu número de pedido, el producto afectado y fotos de la falla. Te responderemos
              con los siguientes pasos a seguir.
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
