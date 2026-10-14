"use client";

import { useShopData } from "@/components/providers/ShopDataProvider";
import { MenuCard } from "./MenuCard";

export default function MenuCatalog() {
  const { menu, loading } = useShopData();

  return (
    <section id="menu" className="relative bg-sayak py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl font-semibold text-kapur sm:text-5xl">
            Pilih seduhanmu
          </h2>
          <p className="mt-5 text-kapur-dim">
            Setiap gelas diseduh saat dipesan dan disajikan dalam sayak. Pesan
            lewat keranjang, atau langsung satu porsi lewat WhatsApp.
          </p>
        </div>

        {loading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[34rem] animate-pulse rounded-2xl border border-kapur/10 bg-sayak-800" />
            ))}
          </div>
        ) : menu.length === 0 ? (
          <p className="mt-14 rounded-2xl border border-kapur/10 bg-sayak-800 p-8 text-kapur-dim">
            Menu belum tersedia. Silakan kembali lagi sebentar lagi.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((item, i) => (
              <MenuCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
