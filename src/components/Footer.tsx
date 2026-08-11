export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-zinc-600 dark:text-zinc-400">
        © {new Date().getFullYear()} Tamehouse. Todos los derechos reservados.
      </div>
    </footer>
  );
}
