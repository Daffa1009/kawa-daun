"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, X, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { buttonClass, Button } from "@/components/ui/Button";
import { useShopStatus } from "@/hooks/useShopStatus";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn, formatRupiah } from "@/lib/utils";
import type { OrderType } from "@/types/menu";

const ORDER_TYPES: OrderType[] = ["Ambil di kedai", "Minum di tempat", "Antar"];

export function CartDrawer() {
  const { isOpen, closeCart, lines, totalPrice, totalQty, add, decrement, remove, clear } =
    useCart();
  const status = useShopStatus();

  const [name, setName] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("Ambil di kedai");
  const [note, setNote] = useState("");
  const [landmark, setLandmark] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation tidak didukung browser ini.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message || "Gagal mengambil lokasi. Aktifkan GPS & izinkan akses.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  // Escape menutup, scroll body dikunci selama drawer terbuka
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  const isAntar = orderType === "Antar";
  const antarReady = !isAntar || !!coords;
  const canOrder = lines.length > 0 && name.trim().length > 0 && antarReady;
  const waUrl = buildWhatsAppUrl(lines, {
    name,
    orderType,
    note,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    landmark,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-sayak-900/70 backdrop-blur-sm"
          />

          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Keranjang pesanan"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-seduh/20 bg-sayak-800"
          >
            <header className="flex items-center justify-between border-b border-kapur/10 px-6 py-5">
              <h2 className="font-display text-2xl text-kapur">
                Keranjang{totalQty > 0 && <span className="text-kapur-dim"> ({totalQty})</span>}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                aria-label="Tutup keranjang"
                className="grid h-9 w-9 place-items-center rounded-full text-kapur-dim hover:bg-kapur/10 hover:text-kapur"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="font-display text-xl text-kapur">Keranjang masih kosong</p>
                <p className="text-sm text-kapur-dim">
                  Pilih menu kawa daun, lalu kembali ke sini untuk mengirim pesanan.
                </p>
                <a href="#menu" onClick={closeCart} className={buttonClass("outline")}>
                  Lihat menu
                </a>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {status && !status.isOpen && (
                    <p className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Kedai sedang tutup. Pesananmu akan dibalas saat kami buka ({status.hours}).
                    </p>
                  )}

                  <ul className="divide-y divide-kapur/10">
                    {lines.map(({ item, qty }) => (
                      <li key={item.id} className="flex gap-4 py-4 first:pt-0">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-kapur">{item.name}</p>
                          <p className="text-sm text-kapur-dim">{formatRupiah(item.price)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <StepperButton label={`Kurangi ${item.name}`} onClick={() => decrement(item.id)}>
                              <Minus className="h-3.5 w-3.5" />
                            </StepperButton>
                            <span className="w-6 text-center text-sm tabular-nums text-kapur">{qty}</span>
                            <StepperButton label={`Tambah ${item.name}`} onClick={() => add(item.id)}>
                              <Plus className="h-3.5 w-3.5" />
                            </StepperButton>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            aria-label={`Hapus ${item.name}`}
                            className="text-kapur-dim hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <p className="text-sm text-kapur">{formatRupiah(item.price * qty)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-5">
                    <Field label="Nama pemesan" htmlFor="nama">
                      <input
                        id="nama"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Mis. Uda Daffa"
                        autoComplete="name"
                        className="field"
                      />
                    </Field>

                    <fieldset>
                      <legend className="mb-2 text-sm text-kapur-dim">Jenis pesanan</legend>
                      <div className="grid grid-cols-3 gap-2">
                        {ORDER_TYPES.map((t) => (
                          <label
                            key={t}
                            className={cn(
                              "cursor-pointer rounded-lg border px-2 py-2 text-center text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-seduh-light",
                              orderType === t
                                ? "border-seduh bg-seduh/15 text-kapur"
                                : "border-kapur/15 text-kapur-dim hover:border-kapur/30",
                            )}
                          >
                            <input
                              type="radio"
                              name="orderType"
                              value={t}
                              checked={orderType === t}
                              onChange={() => setOrderType(t)}
                              className="sr-only"
                            />
                            {t}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {isAntar && (
                      <div className="rounded-xl border border-seduh/20 bg-sayak-900/40 p-4 space-y-3">
                        <p className="text-sm font-medium text-kapur">Lokasi Antar</p>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={gpsLoading || !!coords}
                          className={cn(
                            "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            coords
                              ? "bg-daun text-white"
                              : "bg-seduh text-sayak-900 hover:bg-seduh-light disabled:opacity-60",
                          )}
                        >
                          {gpsLoading ? "Mencari lokasi…" : coords ? "✓ Lokasi Berhasil Didapat" : "📍 Ambil Lokasi GPS Saya"}
                        </button>
                        {coords && (
                          <p className="text-xs text-daun">
                            Koordinat: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)} · <a href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noopener noreferrer" className="underline">Lihat di Maps</a>
                          </p>
                        )}
                        {gpsError && <p className="text-xs text-red-300">{gpsError}</p>}
                        <Field label="Detail Alamat / Patokan Rumah (Opsional)" htmlFor="patokan">
                          <input
                            id="patokan"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="Pagar hitam depan mesjid"
                            className="field"
                          />
                        </Field>
                      </div>
                    )}

                    <Field label="Catatan (opsional)" htmlFor="catatan">
                      <textarea
                        id="catatan"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Mis. kurang manis, alamat antar, dll."
                        className="field resize-none"
                      />
                    </Field>
                  </div>
                </div>

                <footer className="border-t border-kapur/10 px-6 py-5">
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-kapur-dim">Total</span>
                    <span className="font-display text-2xl text-kapur">{formatRupiah(totalPrice)}</span>
                  </div>

                  {canOrder ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeCart}
                      className={buttonClass("whatsapp", "w-full py-3.5 text-base")}
                    >
                      <MessageCircle className="h-5 w-5" />
                      Pesan via WhatsApp
                    </a>
                  ) : isAntar && !coords ? (
                    <Button disabled className="w-full py-3.5 text-base">
                      Ambil lokasi untuk memesan
                    </Button>
                  ) : (
                    <Button disabled className="w-full py-3.5 text-base">
                      <MessageCircle className="h-5 w-5" />
                      Isi nama untuk memesan
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={clear}
                    className="mt-3 w-full text-center text-xs text-kapur-dim hover:text-kapur"
                  >
                    Kosongkan keranjang
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function StepperButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full border border-kapur/20 text-kapur transition-colors hover:border-seduh hover:text-seduh-light"
    >
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm text-kapur-dim">
        {label}
      </label>
      {children}
    </div>
  );
}
