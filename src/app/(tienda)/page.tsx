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
      <section className="relative -mt-20 flex h-[68vh] w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 sm:h-auto sm:min-h-screen sm:items-stretch sm:justify-end">
        <HeroCarrusel slides={heroSlides} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 pb-8 text-center sm:items-start sm:gap-6 sm:pb-12 sm:text-left">
          {heroConfig.subtitulo && (
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-white/70">
              {heroConfig.subtitulo}
            </span>
          )}
          {heroConfig.titulo && (
            <h1 className="whitespace-nowrap text-[clamp(2rem,10vw,3.5rem)] font-extrabold uppercase leading-[0.85] tracking-tight text-white sm:text-[clamp(3rem,12vw,9rem)]">
              {heroConfig.titulo}
            </h1>
          )}
        </div>
      </section>

      <div id="fin-hero" className="h-px w-full" />

      <section id="tienda" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-12">
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
