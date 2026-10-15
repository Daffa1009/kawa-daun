"use client";

import { useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { removeStorageFileByUrl, uploadImage } from "@/lib/supabase/api";
import type { ShopSettings } from "@/types/shop";

type Props = {
  sb: SupabaseClient;
  settings: ShopSettings;
  onSave: (next: ShopSettings, message: string) => Promise<void>;
};

export function PaymentPanel({ sb, settings, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEnable = !!settings.qrisImage;

  const handleToggle = (checked: boolean) => {
    if (checked && !canEnable) return;
    onSave({ ...settings, qrisEnabled: checked }, checked ? "QRIS diaktifkan." : "QRIS dinonaktifkan.");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Ukuran maksimal 4 MB.");
      return;
    }
    const prevUrl = settings.qrisImage;
    setUploading(true);
    try {
      const url = await uploadImage(sb, file, "qris");
      await onSave({ ...settings, qrisImage: url, qrisEnabled: settings.qrisEnabled }, "Foto QRIS disimpan.");
      if (prevUrl) await removeStorageFileByUrl(sb, prevUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Hapus foto QRIS? Pelanggan tidak akan bisa memilih QRIS lagi.")) return;
    const prevUrl = settings.qrisImage;
    await onSave({ ...settings, qrisImage: "", qrisEnabled: false }, "Foto QRIS dihapus.");
    if (prevUrl) await removeStorageFileByUrl(sb, prevUrl);
  };

  return (
    <section aria-labelledby="payment-title" className="rounded-2xl border border-seduh/20 bg-sayak-800 p-6">
      <h2 id="payment-title" className="font-display text-2xl text-kapur">Pembayaran QRIS</h2>
      <p className="mt-1 text-sm text-kapur-dim">Gunakan QRIS milik kedai sendiri. Foto ini akan tampil ke semua pelanggan.</p>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-kapur/10 p-4">
        <div>
          <p className="font-medium text-kapur">Aktifkan pembayaran QRIS</p>
          {!canEnable && <p className="mt-1 text-xs text-amber-300">Unggah foto QRIS terlebih dahulu.</p>}
        </div>
        <Switch checked={settings.qrisEnabled} onChange={handleToggle} label="Aktifkan pembayaran QRIS" disabled={!canEnable} />
      </div>

      {settings.qrisImage ? (
        <div className="mt-5 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.qrisImage} alt="QRIS saat ini" className="max-h-64 rounded-lg bg-white p-2 mx-auto" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4" /> {uploading ? "Mengunggah…" : "Ganti foto"}
            </Button>
            <Button variant="ghost" onClick={handleRemove} disabled={uploading}>
              <Trash2 className="h-4 w-4" /> Hapus foto QRIS
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" /> {uploading ? "Mengunggah…" : "Unggah foto QRIS"}
          </Button>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} aria-label="Unggah foto QRIS" />
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </section>
  );
}
