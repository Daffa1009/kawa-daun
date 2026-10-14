"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatRupiah } from "@/lib/utils";

/** Tombol keranjang melayang — muncul otomatis saat ada item. */
export function FloatingCartButton() {
  const { totalQty, totalPrice, openCart, isOpen } = useCart();
  const visible = totalQty > 0 && !isOpen;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={openCart}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          aria-label={`Buka keranjang: ${totalQty} item, total ${formatRupiah(totalPrice)}`}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-3 rounded-full bg-seduh py-3 pl-4 pr-5 text-sayak-900 shadow-[0_12px_40px_-8px_rgba(200,120,42,0.7)] transition-colors hover:bg-seduh-light sm:bottom-8 sm:right-8"
        >
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-sayak-900 px-1 text-[10px] font-bold text-kapur">
              {totalQty}
            </span>
          </span>
          <span className="text-sm font-semibold">{formatRupiah(totalPrice)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
