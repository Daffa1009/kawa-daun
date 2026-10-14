import type { ShopSettings } from "@/types/shop";

export const SHOP = {
  name: "Kedai Kawa Daun",
  /** Nomor WhatsApp kedai (format internasional, tanpa "+") */
  whatsapp: "6283867313698",
  timezone: "Asia/Jakarta",
} as const;

/**
 * Nilai awal / cadangan. Saat Supabase aktif, nilai asli diambil dari
 * tabel `shop_settings` dan bisa diubah lewat halaman /admin.
 */
export const DEFAULT_SETTINGS: ShopSettings = {
  statusMode: "auto",
  openHour: 10,
  closeHour: 22,
  address: "Jl. Raya Padang-Solok KM 12, Nagari Tanah Datar, Kab. Solok, Sumatera Barat 27365",
  instagram: "@kedaikawadaun",
  phone: SHOP.whatsapp,
  mapEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.383!2d100.36!3d-0.947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid",
  mapLink: "https://maps.google.com/?q=Kedai+Kawa+Daun+Sumatera+Barat",
};
