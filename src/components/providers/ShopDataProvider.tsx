"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MENU } from "@/data/menu";
import { DEFAULT_SETTINGS } from "@/data/shop";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchMenu, fetchSettings } from "@/lib/supabase/api";
import type { MenuItem } from "@/types/menu";
import type { ShopSettings } from "@/types/shop";

type ShopDataValue = {
  menu: MenuItem[];
  settings: ShopSettings;
  loading: boolean;
  getItem: (id: string) => MenuItem | undefined;
};

const ShopDataContext = createContext<ShopDataValue | null>(null);

/**
 * Sumber data tunggal untuk website pelanggan.
 * - Supabase aktif  -> ambil menu & status kedai dari database + update realtime.
 * - Belum ada kunci -> pakai data dummy (src/data/menu.ts) supaya tetap jalan.
 */
export function ShopDataProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(isSupabaseConfigured ? [] : MENU);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const [m, s] = await Promise.all([fetchMenu(sb), fetchSettings(sb)]);
      setMenu(m);
      if (s) setSettings(s);
    } catch (err) {
      console.error("Gagal memuat data dari Supabase:", err);
      setMenu((prev) => (prev.length ? prev : MENU)); // cadangan: data dummy
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    load();

    // Admin mengubah data -> halaman pelanggan ikut berubah tanpa refresh
    const channel = sb
      .channel("kedai-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "shop_settings" }, () => load())
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      sb.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const getItem = useCallback(
    (id: string) => menu.find((m) => m.id === id),
    [menu],
  );

  const value = useMemo(
    () => ({ menu, settings, loading, getItem }),
    [menu, settings, loading, getItem],
  );

  return <ShopDataContext.Provider value={value}>{children}</ShopDataContext.Provider>;
}

export function useShopData() {
  const ctx = useContext(ShopDataContext);
  if (!ctx) throw new Error("useShopData harus dipakai di dalam <ShopDataProvider>");
  return ctx;
}
