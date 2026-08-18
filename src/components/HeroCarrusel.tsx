"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useHero } from "@/lib/hero";
import type { HeroSlide } from "@/lib/heroSlides";

// Fallback si todavia no hay imagenes cargadas desde /admin/hero.
const SLIDES_POR_DEFECTO = [
  { url: "/images/fotoinicio3.jpg", logo_oscuro: true },
  { url: "/images/fotoinicio1.png", logo_oscuro: false },
  { url: "/images/fotoinicio2.png", logo_oscuro: true },
];

const INTERVALO_MS = 5000;

interface HeroCarruselProps {
  slides: HeroSlide[];
}

export default function HeroCarrusel({ slides }: HeroCarruselProps) {
  const [indice, setIndice] = useState(0);
  const { setLogoOscuro } = useHero();

  const slidesAMostrar = slides.length > 0 ? slides : SLIDES_POR_DEFECTO;

  useEffect(() => {
    setLogoOscuro(slidesAMostrar[indice]?.logo_oscuro ?? false);
  }, [indice, slidesAMostrar, setLogoOscuro]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % slidesAMostrar.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [slidesAMostrar]);

  return (
    <>
      {slidesAMostrar.map((slide, i) => (
        <Image
          key={slide.url}
          src={slide.url}
          alt="Aerstame"
          fill
          priority={i === 0}
          sizes="100vw"
          className={`absolute inset-0 object-cover object-top transition-opacity duration-1000 ${
            i === indice ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
