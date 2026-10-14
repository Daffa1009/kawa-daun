import { SHOP } from "@/data/shop";
import type { MenuItem, OrderType } from "@/types/menu";
import { formatRupiah } from "./utils";

export type OrderLine = { item: MenuItem; qty: number };

export type CustomerInfo = {
  name?: string;
  orderType?: OrderType;
  note?: string;
};

export const orderTotal = (lines: OrderLine[]) =>
  lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);

/** Menyusun teks pesanan yang rapi untuk WhatsApp. */
export function buildOrderMessage(
  lines: OrderLine[],
  customer: CustomerInfo = {},
): string {
  const rows = lines.map(
    (l, i) =>
      `${i + 1}. ${l.item.name} x${l.qty} = ${formatRupiah(l.item.price * l.qty)}`,
  );

  const parts = [
    `Halo ${SHOP.name}! 👋`,
    "Saya mau pesan:",
    "",
    ...rows,
    "",
    `*Total: ${formatRupiah(orderTotal(lines))}*`,
  ];

  const meta: string[] = [];
  if (customer.name?.trim()) meta.push(`Nama: ${customer.name.trim()}`);
  if (customer.orderType) meta.push(`Jenis pesanan: ${customer.orderType}`);
  if (customer.note?.trim()) meta.push(`Catatan: ${customer.note.trim()}`);
  if (meta.length) parts.push("", ...meta);

  parts.push("", "Terima kasih 🙏");
  return parts.join("\n");
}

/** Link wa.me siap pakai. */
export function buildWhatsAppUrl(
  lines: OrderLine[],
  customer: CustomerInfo = {},
): string {
  const text = encodeURIComponent(buildOrderMessage(lines, customer));
  return `https://wa.me/${SHOP.whatsapp}?text=${text}`;
}
