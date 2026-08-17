"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useHero } from "@/lib/hero";

const SLIDES = [
  { src: "/images/fotoinicio3.jpg", oscuro: true },
  { src: "/images/fotoinicio1.png", oscuro: false },
  { src: "/images/fotoinicio2.png", oscuro: true },
];

const INTERVALO_MS = 5000;

export default function HeroCarrusel() {
  const [indice, setIndice] = useState(0);
  const { setLogoOscuro } = useHero();

  useEffect(() => {
    setLogoOscuro(SLIDES[indice].oscuro);
  }, [indice, setLogoOscuro]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % SLIDES.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <>
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
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
