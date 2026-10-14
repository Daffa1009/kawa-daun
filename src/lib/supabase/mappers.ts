import type { MenuItem } from "@/types/menu";
import type { ShopSettings, StatusMode } from "@/types/shop";

export type MenuRow = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  spices: string[] | null;
  badge: string | null;
  sold_out: boolean;
  sort_order: number;
};

export type SettingsRow = {
  status_mode: StatusMode;
  open_hour: number;
  close_hour: number;
  address: string;
  instagram: string;
};

export const rowToMenuItem = (r: MenuRow): MenuItem => ({
  id: r.id,
  name: r.name,
  tagline: r.tagline,
  description: r.description,
  price: r.price,
  image: r.image || "/images/tempurung.jpeg",
  spices: r.spices ?? [],
  badge: r.badge ?? undefined,
  soldOut: r.sold_out,
  sortOrder: r.sort_order,
});

export const rowToSettings = (r: SettingsRow): ShopSettings => ({
  statusMode: r.status_mode,
  openHour: r.open_hour,
  closeHour: r.close_hour,
  address: r.address,
  instagram: r.instagram,
});
