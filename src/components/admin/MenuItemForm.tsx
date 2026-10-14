"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveMenuItem, uploadMenuImage } from "@/lib/supabase/api";
import type { MenuItem } from "@/types/menu";

type Props = {
  sb: SupabaseClient;
  initial?: MenuItem;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const MAX_IMAGE_MB = 4;

export function MenuItemForm({ sb, initial, nextSortOrder, onClose, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [spices, setSpices] = useState((initial?.spices ?? []).join(", "));
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [soldOut, setSoldOut] = useState(initial?.soldOut ?? false);
  const [image, setImage] = useState(initial?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("File harus berupa gambar.");
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Ukuran foto maksimal ${MAX_IMAGE_MB} MB.`);
    setError(null);
    setUploading(true);
    try {
      setImage(await uploadMenuImage(sb, file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload foto gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!name.trim()) return setError("Nama menu wajib diisi.");
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError("Harga tidak valid.");

    setBusy(true);
    setError(null);
    try {
      await saveMenuItem(
        sb,
        {
          name,
          tagline,
          description,
          price: priceNum,
          image,
          spices: spices.split(",").map((s) => s.trim()).filter(Boolean),
          badge,
          soldOut,
        },
        { id: initial?.id, sortOrder: nextSortOrder },
      );
      onSaved(initial ? "Menu diperbarui." : "Menu baru ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-sayak-900/80 backdrop-blur-sm sm:place-items-center" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Edit menu" : "Tambah menu"}
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-seduh/25 bg-sayak-800 p-6 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-kapur">{initial ? "Edit menu" : "Tambah menu"}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup"
            className="grid h-9 w-9 place-items-center rounded-full text-kapur-dim hover:bg-kapur/10 hover:text-kapur">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-t-full rounded-b-lg bg-sayak-900">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Pratinjau foto menu" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <label htmlFor="foto" className="mb-2 block text-sm text-kapur-dim">Foto menu</label>
              <input id="foto" type="file" accept="image/*" disabled={uploading}
                onChange={(e) => onPickFile(e.target.files?.[0])}
                className="block w-full text-xs text-kapur-dim file:mr-3 file:rounded-full file:border-0 file:bg-seduh file:px-4 file:py-2 file:text-xs file:font-semibold file:text-sayak-900" />
              {uploading && <p className="mt-1 text-xs text-seduh-light">Mengunggah…</p>}
            </div>
          </div>

          <Field label="Nama menu" id="m-name">
            <input ref={firstField} id="m-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Harga (Rp)" id="m-price">
            <input id="m-price" className="field" inputMode="numeric" value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} />
          </Field>
          <Field label="Kalimat singkat" id="m-tagline">
            <input id="m-tagline" className="field" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </Field>
          <Field label="Deskripsi" id="m-desc">
            <textarea id="m-desc" rows={3} className="field resize-none" value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Bahan (pisahkan dengan koma)" id="m-spices">
            <input id="m-spices" className="field" value={spices} onChange={(e) => setSpices(e.target.value)}
              placeholder="Daun kopi, Jahe, Kayu manis" />
          </Field>
          <Field label="Label (opsional, mis. Terlaris)" id="m-badge">
            <input id="m-badge" className="field" value={badge} onChange={(e) => setBadge(e.target.value)} />
          </Field>

          <label className="flex items-center gap-3 text-sm text-kapur">
            <input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)}
              className="h-4 w-4 accent-[#C8782A]" />
            Tandai habis
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={busy || uploading} className="flex-1">
            {busy ? "Menyimpan…" : "Simpan"}
          </Button>
          <Button variant="outline" onClick={onClose}>Batal</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-kapur-dim">{label}</label>
      {children}
    </div>
  );
}
