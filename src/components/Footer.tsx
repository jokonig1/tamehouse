const NAVEGACION = [
  { href: "/", label: "Tienda" },
  { href: "/musica", label: "Música" },
  { href: "/shows", label: "Shows" },
];

const POLITICAS = [
  { href: "#", label: "Política de devoluciones" },
  { href: "#", label: "Política de envíos" },
  { href: "#", label: "Política de privacidad" },
  { href: "#", label: "Términos del servicio" },
];

function IconoRedSocial({ nombre }: { nombre: "facebook" | "youtube" | "instagram" | "tiktok" }) {
  const paths: Record<typeof nombre, React.ReactNode> = {
    facebook: (
      <path d="M14 9h2V6h-2c-1.66 0-3 1.34-3 3v2H9v3h2v6h3v-6h2.1l.4-3H14V9c0-.28.22-.5.5-.5H14V9Z" />
    ),
    youtube: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" />
      </>
    ),
    instagram: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth={1.5} />
        <circle cx="17.2" cy="6.8" r="1.1" />
      </>
    ),
    tiktok: (
      <path d="M15 3v9.5a2.8 2.8 0 1 1-2.4-2.77V7.3a5.3 5.3 0 1 0 4.9 5.28V9.3a5.9 5.9 0 0 0 3.5 1.15V7.9A3.5 3.5 0 0 1 17.5 4.4V3H15Z" />
    ),
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      {paths[nombre]}
    </svg>
  );
}

const REDES: { nombre: "facebook" | "youtube" | "instagram" | "tiktok"; href: string }[] = [
  { nombre: "facebook", href: "#" },
  { nombre: "youtube", href: "#" },
  { nombre: "instagram", href: "#" },
  { nombre: "tiktok", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-black text-white/80">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-6 py-16 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-lg font-bold tracking-[0.2em] text-white uppercase">Tamehouse</p>

          <p className="mt-8 text-sm font-semibold text-white">Contacto</p>
          <a
            href="mailto:contacto@tamehouse.cl"
            className="mt-3 flex w-fit items-center gap-3 text-sm hover:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 6 8.5 7 8.5-7" />
              </svg>
            </span>
            contacto@tamehouse.cl
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Navegación</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {NAVEGACION.map((enlace) => (
              <li key={enlace.href}>
                <a href={enlace.href} className="hover:text-white">
                  {enlace.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Políticas</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {POLITICAS.map((enlace) => (
              <li key={enlace.label}>
                <a href={enlace.href} className="hover:text-white">
                  {enlace.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Nuestras redes</p>
          <div className="mt-4 flex gap-3">
            {REDES.map((red) => (
              <a
                key={red.nombre}
                href={red.href}
                aria-label={red.nombre}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-opacity hover:opacity-80"
              >
                <IconoRedSocial nombre={red.nombre} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Tamehouse. Todos los derechos reservados.
      </div>
    </footer>
  );
}
