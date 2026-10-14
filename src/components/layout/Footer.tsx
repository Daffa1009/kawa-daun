"use client";

import { MessageCircle } from "lucide-react";
import { SHOP } from "@/data/shop";
import { Ukiran } from "@/components/ui/Ukiran";
import { LogoMark } from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";
import { useShopData } from "@/components/providers/ShopDataProvider";
import { formatHours } from "@/lib/shop";

export function Footer() {
  const { settings } = useShopData();
  const waHref = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(
    `Halo ${SHOP.name}!`,
  )}`;

  return (
    <footer id="kontak" className="bg-sayak-900">
      <Ukiran className="opacity-40" />
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-display text-xl text-kapur">{SHOP.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-kapur-dim">
            Kawa daun seduhan tradisional Minangkabau, disajikan dalam sayak.
          </p>
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "mt-6")}>
            <MessageCircle className="h-4 w-4" />
            Chat WhatsApp
          </a>
        </div>

        <div>
          <h3 className="font-display text-lg text-kapur">Jam buka</h3>
          <p className="mt-3 text-sm text-kapur-dim">
            Setiap hari
            <br />
            {formatHours(settings.openHour, settings.closeHour)}
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg text-kapur">Lokasi</h3>
          <p className="mt-3 text-sm text-kapur-dim">{settings.address}</p>
          <p className="mt-2 text-sm text-kapur-dim">Instagram {settings.instagram}</p>
        </div>
      </div>
      <p className="border-t border-kapur/10 px-6 py-5 text-center text-xs text-kapur-dim/70">
        © {new Date().getFullYear()} {SHOP.name}. Seluruh hak cipta dilindungi.
      </p>
    </footer>
  );
}
