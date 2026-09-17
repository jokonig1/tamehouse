import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HeroProvider } from "@/lib/hero";

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeroProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </HeroProvider>
  );
}
