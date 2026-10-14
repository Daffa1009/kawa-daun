import { ShopDataProvider } from "@/components/providers/ShopDataProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { Navbar } from "@/components/layout/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopDataProvider>
      <CartProvider>
        <Navbar />
        {children}
        <FloatingCartButton />
        <CartDrawer />
      </CartProvider>
    </ShopDataProvider>
  );
}
