import Image from "next/image";
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="mx-auto grid h-20 max-w-6xl grid-cols-3 items-center px-6">
        <Link href="/admin/productos" aria-label="Tamehouse" className="flex items-center">
          <Image
            src="/images/logolobo1.png"
            alt="Tamehouse"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
        </Link>

        <span className="hidden justify-self-center text-xs font-medium uppercase tracking-widest text-white/70 sm:block">
          Panel de administración
        </span>

        <span className="justify-self-end text-xs font-medium uppercase tracking-widest text-white/70">
          Admin
        </span>
      </div>
    </header>
  );
}
