import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** 18000 -> "Rp 18.000" (spasi biasa, aman untuk pesan WhatsApp) */
export function formatRupiah(value: number) {
  return rupiah.format(value).replace(/\u00a0/g, " ");
}

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));
