"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Tienda" },
  { href: "/musica", label: "Música" },
  { href: "/biografia", label: "Biografía" },
];

export default function Header() {
  const pathname = usePathname();

  function irAlInicio(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="grid h-24 w-full grid-cols-3 items-center px-6 sm:px-10">
        <Link href="/" aria-label="Tamehouse" className="flex items-center" onClick={irAlInicio}>
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            priority
          />
        </Link>

        <nav className="hidden justify-center gap-10 text-sm font-medium uppercase tracking-widest sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={link.href === "/" ? irAlInicio : undefined}
              className="hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-8">
          <Link
            href="/login"
            className="hidden text-sm font-medium uppercase tracking-widest hover:opacity-70 sm:block"
          >
            Ingresa
          </Link>
          <Link href="/carrito" aria-label="Carrito" className="hover:opacity-70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 7V6a6 6 0 1 1 12 0v1M3.5 7h17l-1.2 13.2a2 2 0 0 1-2 1.8H6.7a2 2 0 0 1-2-1.8L3.5 7Z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
