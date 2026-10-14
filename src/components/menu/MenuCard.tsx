"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, Plus } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import { useCart } from "@/components/cart/CartProvider";
import { Button, buttonClass } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn, formatRupiah } from "@/lib/utils";

export function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const { add, qtyOf, openCart } = useCart();
  const qty = qtyOf(item.id);

  // Tombol "Pesan via WhatsApp" langsung untuk 1 porsi menu ini
  const directOrderUrl = buildWhatsAppUrl([{ item, qty: 1 }]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      aria-label={item.soldOut ? `${item.name}, habis` : item.name}
      className={cn(
        "group flex flex-col rounded-2xl border bg-sayak-800 p-4 transition-colors duration-300",
        item.soldOut
          ? "border-kapur/10"
          : "border-seduh/20 hover:border-seduh/60",
      )}
    >
      {/* Gambar berbentuk lengkung (mengingatkan pada bentuk tempurung) */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-xl bg-sayak-900">
        <Image
          src={item.image}
          alt={`${item.name} dalam sayak`}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
          className={cn(
            "object-cover transition-transform duration-700",
            item.soldOut ? "grayscale" : "group-hover:scale-105",
          )}
        />

        {item.soldOut ? (
          <div className="absolute inset-0 grid place-items-center bg-sayak-900/60">
            <span className="-rotate-6 rounded-md border-2 border-kapur/80 px-5 py-1.5 font-display text-3xl font-semibold tracking-wide text-kapur">
              Habis
            </span>
          </div>
        ) : (
          item.badge && (
            <span className="absolute left-1/2 top-[14%] -translate-x-1/2 rounded-full bg-seduh px-3 py-1 text-xs font-semibold text-sayak-900">
              {item.badge}
            </span>
          )
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col px-1">
        <p className={cn("text-sm", item.soldOut ? "text-kapur-dim/60" : "text-seduh-light")}>
          {item.tagline}
        </p>
        <h3
          className={cn(
            "mt-1 font-display text-2xl font-semibold",
            item.soldOut ? "text-kapur/60" : "text-kapur",
          )}
        >
          {item.name}
        </h3>
        <p className={cn("mt-3 text-sm leading-relaxed", item.soldOut ? "text-kapur-dim/60" : "text-kapur-dim")}>
          {item.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Bahan">
          {item.spices.map((s) => (
            <li
              key={s}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs",
                item.soldOut
                  ? "border-kapur/10 text-kapur-dim/50"
                  : "border-seduh/25 text-kapur-dim",
              )}
            >
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <p
            className={cn(
              "font-display text-2xl",
              item.soldOut ? "text-kapur-dim/50 line-through" : "text-kapur",
            )}
          >
            {formatRupiah(item.price)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            {item.soldOut ? (
              <Button disabled aria-disabled className="flex-1">
                Habis
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => add(item.id)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4" />
                  {qty > 0 ? `Tambah lagi (${qty})` : "Tambah ke Keranjang"}
                </Button>
                <a
                  href={directOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Pesan ${item.name} langsung via WhatsApp`}
                  title="Pesan 1 porsi langsung via WhatsApp"
                  className={buttonClass("whatsapp", "h-10 w-10 shrink-0 !p-0")}
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                </a>
              </>
            )}
          </div>

          {qty > 0 && !item.soldOut && (
            <button
              type="button"
              onClick={openCart}
              className="mt-3 text-xs text-seduh-light underline-offset-4 hover:underline"
            >
              Lihat keranjang
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
