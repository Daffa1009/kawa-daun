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
  address: "Jl. Contoh No. 12, Sumatera Barat",
  instagram: "@kedaikawadaun",
};
