import type { SupabaseClient } from "@supabase/supabase-js";
import type { MenuItem } from "@/types/menu";
import type { ShopSettings } from "@/types/shop";
import {
  rowToMenuItem,
  rowToSettings,
  type MenuRow,
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
    })
    .select("id");
  assertWritten(data, error);
}

export async function uploadMenuImage(
  sb: SupabaseClient,
  file: File,
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage
    .from("menu-images")
    .upload(path, file, { cacheControl: "3600", contentType: file.type });
  if (error) throw new Error(error.message);
  return sb.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
}
