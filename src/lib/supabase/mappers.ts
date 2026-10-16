import type { MenuItem } from "@/types/menu";
import type { Review, ReviewStatus } from "@/types/review";
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
  phone?: string | null;
  map_embed_src?: string | null;
  map_link?: string | null;
  qris_enabled?: boolean | null;
  qris_image?: string | null;
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
  phone: r.phone ?? "6281234567890",
  mapEmbedSrc: r.map_embed_src ?? "",
  mapLink: r.map_link ?? "https://maps.google.com",
  qrisEnabled: !!r.qris_enabled,
  qrisImage: r.qris_image ?? "",
});

export type ReviewRow = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
};

export const rowToReview = (r: ReviewRow): Review => ({
  id: r.id,
  name: r.name,
  rating: r.rating,
  comment: r.comment,
  status: r.status,
  createdAt: r.created_at,
});
