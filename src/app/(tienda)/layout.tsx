import BarraEnvio from "@/components/BarraEnvio";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { HeroProvider } from "@/lib/hero";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <HeroProvider>
        <BarraEnvio />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </HeroProvider>
    </CartProvider>
  );
}
