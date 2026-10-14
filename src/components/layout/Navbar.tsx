"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { LogoMark } from "@/components/ui/Logo";
import { ShopStatusBadge } from "./ShopStatusBadge";
import { SHOP } from "@/data/shop";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#cerita", label: "Cerita" },
  { href: "#menu", label: "Menu" },
  { href: "#kontak", label: "Kontak" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalQty, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || mobileOpen
          ? "border-b border-seduh/15 bg-sayak/80 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-sayak/70 to-transparent",
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        <a href="#beranda" className="flex items-center gap-2.5" aria-label={`${SHOP.name} — ke atas`}>
          <LogoMark />
          <span className="font-display text-lg leading-none tracking-tight text-kapur">
            Kedai Kawa Daun
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-kapur-dim transition-colors hover:text-seduh-light"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <ShopStatusBadge />

          <button
            type="button"
            onClick={openCart}
            aria-label={`Buka keranjang, ${totalQty} item`}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-seduh/30 text-kapur transition-colors hover:bg-seduh/10"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            <AnimatePresence>
              {totalQty > 0 && (
                <motion.span
                  key={totalQty}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-seduh px-1 text-[11px] font-bold text-sayak-900"
                >
                  {totalQty}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Menu navigasi"
            className="grid h-10 w-10 place-items-center rounded-full text-kapur md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4 md:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block border-t border-kapur/10 py-3 text-kapur"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
