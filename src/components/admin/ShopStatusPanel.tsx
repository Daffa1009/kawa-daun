"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { computeShopStatus } from "@/lib/shop";
import { cn } from "@/lib/utils";
import type { ShopSettings, StatusMode } from "@/types/shop";

const MODES: { value: StatusMode; title: string; desc: string }[] = [
  { value: "auto", title: "Otomatis", desc: "Ikut jam buka harian" },
  { value: "open", title: "Buka sekarang", desc: "Abaikan jam buka" },
  { value: "closed", title: "Tutup sekarang", desc: "Libur atau tutup mendadak" },
];

type Props = {
  settings: ShopSettings;
  onSave: (next: ShopSettings, message: string) => Promise<void>;
};

export function ShopStatusPanel({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  const live = computeShopStatus(settings);

  async function saveDetails(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await onSave({ ...settings, ...draft, statusMode: settings.statusMode }, "Pengaturan kedai disimpan.");
    setBusy(false);
  }

  return (
    <section aria-labelledby="status-title" className="rounded-2xl border border-seduh/20 bg-sayak-800 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="status-title" className="font-display text-2xl text-kapur">Status kedai</h2>
        <span
          role="status"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
            live.isOpen
              ? "border-daun/40 bg-daun/10 text-[#B5D88A]"
              : "border-red-400/30 bg-red-500/10 text-red-300",
          )}
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", live.isOpen ? "bg-daun" : "bg-red-400")} />
          Saat ini: {live.label}
        </span>
      </div>

      <fieldset className="mt-5">
        <legend className="sr-only">Mode status kedai</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-seduh-light",
                settings.statusMode === m.value
                  ? "border-seduh bg-seduh/15"
                  : "border-kapur/15 hover:border-kapur/30",
              )}
            >
              <input
                type="radio"
                name="statusMode"
                value={m.value}
                checked={settings.statusMode === m.value}
                onChange={() =>
                  onSave(
                    { ...settings, statusMode: m.value },
                    m.value === "auto"
                      ? "Status kedai mengikuti jam buka."
                      : m.value === "open"
                        ? "Kedai ditandai BUKA."
                        : "Kedai ditandai TUTUP.",
                  )
                }
                className="sr-only"
              />
              <span className="block font-medium text-kapur">{m.title}</span>
              <span className="mt-1 block text-xs text-kapur-dim">{m.desc}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <form onSubmit={saveDetails} className="mt-6 grid gap-4 border-t border-kapur/10 pt-6 sm:grid-cols-2">
        <div>
          <label htmlFor="openHour" className="mb-2 block text-sm text-kapur-dim">Jam buka</label>
          <select id="openHour" className="field" value={draft.openHour}
            onChange={(e) => setDraft({ ...draft, openHour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}.00</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="closeHour" className="mb-2 block text-sm text-kapur-dim">Jam tutup</label>
          <select id="closeHour" className="field" value={draft.closeHour}
            onChange={(e) => setDraft({ ...draft, closeHour: Number(e.target.value) })}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, "0")}.00</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className="mb-2 block text-sm text-kapur-dim">Alamat kedai</label>
          <textarea id="address" rows={2} className="field resize-none" value={draft.address}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Jl. Raya Padang-Solok KM 12..." />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm text-kapur-dim">No. HP / WA (628xxx)</label>
          <input id="phone" className="field" value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="6281234567890" />
        </div>
        <div>
          <label htmlFor="instagram" className="mb-2 block text-sm text-kapur-dim">Instagram</label>
          <input id="instagram" className="field" value={draft.instagram}
            onChange={(e) => setDraft({ ...draft, instagram: e.target.value })} placeholder="@kedaikawadaun" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mapLink" className="mb-2 block text-sm text-kapur-dim">Link Google Maps (tombol arah)</label>
          <input id="mapLink" className="field" value={draft.mapLink}
            onChange={(e) => setDraft({ ...draft, mapLink: e.target.value })} placeholder="https://maps.google.com/?q=..." />
          <p className="mt-1 text-xs text-kapur-dim/60">Buka Google Maps → Share → Copy link</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="mapEmbed" className="mb-2 block text-sm text-kapur-dim">Embed URL Google Maps (iframe)</label>
          <textarea id="mapEmbed" rows={3} className="field resize-none font-mono text-xs" value={draft.mapEmbedSrc}
            onChange={(e) => setDraft({ ...draft, mapEmbedSrc: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=..." />
          <p className="mt-1 text-xs text-kapur-dim/60">Maps → Share → Embed a map → Copy HTML → ambil isi src=&quot;...&quot;</p>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Simpan jam & info kedai"}</Button>
        </div>
      </form>
    </section>
  );
}
