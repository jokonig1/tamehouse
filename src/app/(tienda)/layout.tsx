import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </CartProvider>
  );
}
