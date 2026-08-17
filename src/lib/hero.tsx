"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HeroContextValue = {
  logoOscuro: boolean;
  setLogoOscuro: (valor: boolean) => void;
};

const HeroContext = createContext<HeroContextValue | null>(null);

export function HeroProvider({ children }: { children: ReactNode }) {
  const [logoOscuro, setLogoOscuro] = useState(false);

  return (
    <HeroContext.Provider value={{ logoOscuro, setLogoOscuro }}>
      {children}
    </HeroContext.Provider>
  );
}

export function useHero() {
  const ctx = useContext(HeroContext);
  if (!ctx) throw new Error("useHero debe usarse dentro de HeroProvider");
  return ctx;
}
