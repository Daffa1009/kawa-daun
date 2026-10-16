"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SETTINGS } from "@/data/shop";
import {
  deleteMenuItem,
  fetchMenu,
  fetchSettings,
  saveSettings,
  updateSoldOut,
} from "@/lib/supabase/api";
import { cn } from "@/lib/utils";
import { MenuManager } from "./MenuManager";
import { PaymentPanel } from "./PaymentPanel";
import { ReviewsPanel } from "./ReviewsPanel";
import { ShopStatusPanel } from "./ShopStatusPanel";
import type { MenuItem } from "@/types/menu";
import type { ShopSettings } from "@/types/shop";

type Toast = { type: "ok" | "err"; text: string };
const errText = (e: unknown) => (e instanceof Error ? e.message : "Terjadi kesalahan.");

export function Dashboard({ sb, email }: { sb: SupabaseClient; email: string }) {
  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((type: Toast["type"], text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      const [m, s] = await Promise.all([fetchMenu(sb), fetchSettings(sb)]);
      setMenu(m);
      if (s) setSettings(s);
    } catch (e) {
      notify("err", errText(e));
    }
  }, [sb, notify]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function onToggleSoldOut(item: MenuItem, soldOut: boolean) {
    const before = menu;
    setMenu((cur) => cur?.map((m) => (m.id === item.id ? { ...m, soldOut } : m)) ?? cur); // optimistis
    try {
      await updateSoldOut(sb, item.id, soldOut);
      notify("ok", `${item.name} ditandai ${soldOut ? "habis" : "tersedia"}.`);
    } catch (e) {
      setMenu(before);
      notify("err", errText(e));
    }
  }

  async function onDelete(item: MenuItem) {
    if (!window.confirm(`Hapus menu "${item.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteMenuItem(sb, item.id);
      setMenu((cur) => cur?.filter((m) => m.id !== item.id) ?? cur);
      notify("ok", "Menu dihapus.");
    } catch (e) {
      notify("err", errText(e));
    }
  }

  async function onSaveSettings(next: ShopSettings, message: string) {
    const before = settings;
    setSettings(next);
    try {
      await saveSettings(sb, next);
      notify("ok", message);
    } catch (e) {
      setSettings(before);
      notify("err", errText(e));
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-kapur">Panel Admin</h1>
          <p className="mt-1 text-sm text-kapur-dim">Masuk sebagai {email}</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-seduh/40 px-4 py-2 text-sm text-kapur hover:bg-seduh/10">
            <ExternalLink className="h-4 w-4" /> Lihat website
          </a>
          <Button variant="ghost" onClick={() => sb.auth.signOut()}>
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <ShopStatusPanel settings={settings} onSave={onSaveSettings} />
        <PaymentPanel sb={sb} settings={settings} onSave={onSaveSettings} />
        <ReviewsPanel sb={sb} notify={notify} />
        {menu === null ? (
          <p className="text-sm text-kapur-dim">Memuat menu…</p>
        ) : (
          <MenuManager
            sb={sb}
            menu={menu}
            onToggleSoldOut={onToggleSoldOut}
            onDelete={onDelete}
            onChanged={(msg) => {
              notify("ok", msg);
              reload();
            }}
          />
        )}
      </div>

      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium shadow-lg",
            toast.type === "ok" ? "bg-daun text-sayak-900" : "bg-red-500 text-white",
          )}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
