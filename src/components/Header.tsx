import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Tienda" },
  { href: "/musica", label: "Música" },
  { href: "/biografia", label: "Biografía" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-3 items-center px-6">
        <Link href="/" aria-label="Tamehouse" className="flex items-center">
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
        </Link>

        <nav className="hidden justify-center gap-8 text-xs font-medium uppercase tracking-widest sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-70">
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrito"
          aria-label="Carrito"
          className="justify-self-end hover:opacity-70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 7V6a6 6 0 1 1 12 0v1M3.5 7h17l-1.2 13.2a2 2 0 0 1-2 1.8H6.7a2 2 0 0 1-2-1.8L3.5 7Z"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
