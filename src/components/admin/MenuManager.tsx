"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn, formatRupiah } from "@/lib/utils";
import { MenuItemForm } from "./MenuItemForm";
import type { MenuItem } from "@/types/menu";

type Props = {
  sb: SupabaseClient;
  menu: MenuItem[];
  onToggleSoldOut: (item: MenuItem, soldOut: boolean) => void;
  onDelete: (item: MenuItem) => void;
  onChanged: (message: string) => void;
};

export function MenuManager({ sb, menu, onToggleSoldOut, onDelete, onChanged }: Props) {
  // undefined = form tertutup, null = tambah baru, MenuItem = edit
  const [editing, setEditing] = useState<MenuItem | null | undefined>(undefined);
  const nextSort = menu.reduce((m, i) => Math.max(m, i.sortOrder ?? 0), 0) + 1;

  return (
    <section aria-labelledby="menu-title" className="rounded-2xl border border-seduh/20 bg-sayak-800 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="menu-title" className="font-display text-2xl text-kapur">Menu & stok</h2>
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> Tambah menu
        </Button>
      </div>
      <p className="mt-2 text-sm text-kapur-dim">
        Geser saklar untuk menandai menu tersedia atau habis. Perubahan langsung tampil di website.
      </p>

      {menu.length === 0 ? (
        <p className="mt-6 text-sm text-kapur-dim">Belum ada menu. Tambahkan menu pertama Anda.</p>
      ) : (
        <ul className="mt-5 divide-y divide-kapur/10">
          {menu.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 sm:flex-nowrap">
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-t-full rounded-b-md bg-sayak-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className={cn("h-full w-full object-cover", item.soldOut && "grayscale")} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-kapur">{item.name}</p>
                <p className="text-sm text-kapur-dim">{formatRupiah(item.price)}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={cn("w-16 text-right text-xs", item.soldOut ? "text-red-300" : "text-[#B5D88A]")}>
                  {item.soldOut ? "Habis" : "Tersedia"}
                </span>
                <Switch
                  checked={!item.soldOut}
                  onChange={(available) => onToggleSoldOut(item, !available)}
                  label={`${item.name}: ${item.soldOut ? "habis" : "tersedia"}`}
                />
              </div>

              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-kapur-dim hover:bg-kapur/10 hover:text-kapur">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(item)} aria-label={`Hapus ${item.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full text-kapur-dim hover:bg-red-500/15 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== undefined && (
        <MenuItemForm
          sb={sb}
          initial={editing ?? undefined}
          nextSortOrder={nextSort}
          onClose={() => setEditing(undefined)}
          onSaved={(msg) => {
            setEditing(undefined);
            onChanged(msg);
          }}
        />
      )}
    </section>
  );
}
