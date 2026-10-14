import { SHOP } from "@/data/shop";
import type { ShopSettings, ShopStatus } from "@/types/shop";

const pad = (n: number) => String(n).padStart(2, "0");

export const formatHours = (open: number, close: number) =>
  `${pad(open)}.00 – ${pad(close)}.00 WIB`;

function withinHours(hour: number, open: number, close: number) {
  // Mendukung jam buka yang melewati tengah malam (mis. 18 -> 02)
  return open < close ? hour >= open && hour < close : hour >= open || hour < close;
}

export function computeShopStatus(
  settings: ShopSettings,
  now: Date = new Date(),
): ShopStatus {
  const hours = formatHours(settings.openHour, settings.closeHour);

  let isOpen: boolean;
  if (settings.statusMode === "open") isOpen = true;
  else if (settings.statusMode === "closed") isOpen = false;
  else {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: SHOP.timezone,
        hour: "numeric",
        hourCycle: "h23",
      }).format(now),
    );
    isOpen = withinHours(hour, settings.openHour, settings.closeHour);
  }

  return {
    isOpen,
    label: isOpen ? "Kedai Buka" : "Kedai Tutup",
    hours,
    mode: settings.statusMode,
  };
}
