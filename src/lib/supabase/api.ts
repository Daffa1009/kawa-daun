import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuItem } from "@/types/menu";
import type { Review, ReviewStats, ReviewStatus } from "@/types/review";
import type { ShopSettings } from "@/types/shop";
import {
  rowToMenuItem,
  rowToReview,
  rowToSettings,
  type MenuRow,
  type ReviewRow,
  type SettingsRow,
} from "./mappers";

/* ---------- Baca (publik) ---------- */

export async function fetchMenu(sb: SupabaseClient): Promise<MenuItem[]> {
  const { data, error } = await sb
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as MenuRow[]).map(rowToMenuItem);
}

export async function fetchSettings(
  sb: SupabaseClient,
): Promise<ShopSettings | null> {
  const { data, error } = await sb
    .from("shop_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSettings(data as SettingsRow) : null;
}

/* ---------- Tulis (khusus admin, dijaga RLS di database) ---------- */

/** RLS menolak tulis secara diam-diam (0 baris) -> deteksi dan beri pesan jelas. */
function assertWritten(data: unknown[] | null, error: { message: string } | null) {
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "Perubahan tidak tersimpan. Pastikan akun ini sudah terdaftar di tabel admins.",
    );
  }
}

export async function updateSoldOut(
  sb: SupabaseClient,
  id: string,
  soldOut: boolean,
) {
  const { data, error } = await sb
    .from("menu_items")
    .update({ sold_out: soldOut })
    .eq("id", id)
    .select("id");
  assertWritten(data, error);
}

export type MenuFormValues = {
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  spices: string[];
  badge: string;
  soldOut: boolean;
};

export async function saveMenuItem(
  sb: SupabaseClient,
  v: MenuFormValues,
  opts: { id?: string; sortOrder: number },
) {
  const payload = {
    name: v.name.trim(),
    tagline: v.tagline.trim(),
    description: v.description.trim(),
    price: Math.round(v.price),
    image: v.image.trim(),
    spices: v.spices,
    badge: v.badge.trim() || null,
    sold_out: v.soldOut,
  };

  if (opts.id) {
    const { data, error } = await sb
      .from("menu_items")
      .update(payload)
      .eq("id", opts.id)
      .select("id");
    assertWritten(data, error);
  } else {
    const { data, error } = await sb
      .from("menu_items")
      .insert({ ...payload, sort_order: opts.sortOrder })
      .select("id");
    assertWritten(data, error);
  }
}

export async function deleteMenuItem(sb: SupabaseClient, id: string) {
  const { data, error } = await sb
    .from("menu_items")
    .delete()
    .eq("id", id)
    .select("id");
  assertWritten(data, error);
}

export async function saveSettings(sb: SupabaseClient, s: ShopSettings) {
  const { data, error } = await sb
    .from("shop_settings")
    .upsert({
      id: 1,
      status_mode: s.statusMode,
      open_hour: s.openHour,
      close_hour: s.closeHour,
      address: s.address.trim(),
      instagram: s.instagram.trim(),
      phone: s.phone.replace(/\D/g, ""),
      map_embed_src: s.mapEmbedSrc.trim(),
      map_link: s.mapLink.trim(),
      qris_enabled: s.qrisEnabled,
      qris_image: s.qrisImage.trim(),
    })
    .select("id");
  assertWritten(data, error);
}

export async function uploadMenuImage(
  sb: SupabaseClient,
  file: File,
): Promise<string> {
  return uploadImage(sb, file, "menu");
}

export async function uploadImage(
  sb: SupabaseClient,
  file: File,
  folder: "menu" | "qris",
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from("menu-images")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });
  if (error) throw new Error(error.message);
  return sb.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
}

export async function removeStorageFileByUrl(sb: SupabaseClient, publicUrl: string) {
  try {
    const marker = "/menu-images/";
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return;
    const urlPart = publicUrl.slice(idx + marker.length).split("?")[0].split("#")[0];
    const path = decodeURIComponent(urlPart);
    if (!path) return;
    await sb.storage.from("menu-images").remove([path]);
  } catch {
    // ignore — don't fail save on cleanup error
  }
}

/* ---------- Ulasan (publik) ---------- */

export async function fetchApprovedReviews(sb: SupabaseClient, limit = 12): Promise<Review[]> {
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map(rowToReview);
}

export async function fetchReviewStats(sb: SupabaseClient): Promise<ReviewStats> {
  const { data, error } = await sb.rpc("get_review_stats");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { average: Number(row?.avg_rating ?? 0), total: Number(row?.total ?? 0) };
}

export async function submitReview(
  sb: SupabaseClient,
  input: { name: string; rating: number; comment: string },
) {
  const { error } = await sb.from("reviews").insert({
    name: input.name.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
  });
  if (error) throw new Error(error.message);
}

/* ---------- Ulasan (admin) ---------- */

export async function fetchAllReviews(sb: SupabaseClient): Promise<Review[]> {
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map(rowToReview);
}

export async function setReviewStatus(sb: SupabaseClient, id: string, status: ReviewStatus) {
  const { data, error } = await sb
    .from("reviews")
    .update({ status })
    .eq("id", id)
    .select("id");
  assertWritten(data, error);
}

export async function deleteReview(sb: SupabaseClient, id: string) {
  const { data, error } = await sb
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id");
  assertWritten(data, error);
}
