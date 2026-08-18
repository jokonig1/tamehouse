import HeroCarrusel from "@/components/HeroCarrusel";
import TiendaFiltrable from "@/components/TiendaFiltrable";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getConfiguracionHero } from "@/lib/heroConfig";
import { getHeroSlides } from "@/lib/heroSlides";
import { getProductos } from "@/lib/productos";

export default async function Home() {
  const [productos, heroSlides, heroConfig] = await Promise.all([
    getProductos(),
    getHeroSlides(),
    getConfiguracionHero(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative -mt-20 flex min-h-screen w-full flex-col justify-end overflow-hidden bg-zinc-950">
        <HeroCarrusel slides={heroSlides} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
            {heroConfig.subtitulo}
          </span>
          <h1 className="whitespace-nowrap text-[clamp(3rem,12vw,9rem)] font-extrabold uppercase leading-[0.85] tracking-tight text-white">
            {heroConfig.titulo}
          </h1>
        </div>
      </section>

      <div id="fin-hero" className="h-px w-full" />

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <RevealOnScroll>
          <h2 className="text-2xl font-semibold tracking-tight">Tienda</h2>
          <div className="mt-6">
            <TiendaFiltrable productos={productos} />
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
