"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchApprovedReviews, fetchReviewStats, submitReview } from "@/lib/supabase/api";
import type { Review } from "@/types/review";
import type { ReviewStats } from "@/types/review";
import { StarDisplay, StarInput } from "./StarRating";

const LS_KEY = "kkd_review_at";
const ONE_DAY = 24 * 60 * 60 * 1000;

function recentlyReviewed(): boolean {
  try {
    const ts = localStorage.getItem(LS_KEY);
    return ts ? Date.now() - Number(ts) < ONE_DAY : false;
  } catch {
    return false;
  }
}

function markReviewed() {
  try {
    localStorage.setItem(LS_KEY, String(Date.now()));
  } catch {
    // storage unavailable
  }
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);
  try {
    const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
    if (year > 0) return rtf.format(-year, "year");
    if (month > 0) return rtf.format(-month, "month");
    if (day > 0) return rtf.format(-day, "day");
    if (hr > 0) return rtf.format(-hr, "hour");
    if (min > 0) return rtf.format(-min, "minute");
    return "baru saja";
  } catch {
    return `${day} hari lalu`;
  }
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, total: 0 });
  const [showAll, setShowAll] = useState(false);

  // form
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [honey, setHoney] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    try {
      const [r, s] = await Promise.all([fetchApprovedReviews(sb), fetchReviewStats(sb)]);
      setReviews(r);
      setStats(s);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    load();
    setAlreadySent(recentlyReviewed());

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  if (!isSupabaseConfigured) return null;

  const displayed = showAll ? reviews : reviews.slice(0, 6);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (honey) {
      setSuccess(true);
      return;
    }
    if (!name.trim()) {
      setFormError("Nama wajib diisi.");
      return;
    }
    if (rating === 0) {
      setFormError("Pilih bintang terlebih dahulu.");
      return;
    }
    const sb = getSupabase();
    if (!sb) return;
    setSending(true);
    try {
      await submitReview(sb, { name, rating, comment });
      markReviewed();
      setSuccess(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal mengirim ulasan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="ulasan" className="relative bg-sayak-900 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl text-kapur sm:text-4xl">Kata mereka tentang kami</h2>
          {stats.total > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="font-display text-4xl text-kapur">{stats.average}</span>
              <StarDisplay value={stats.average} size={22} />
              <span className="text-sm text-kapur-dim">dari {stats.total} ulasan</span>
            </div>
          ) : (
            <p className="mt-4 text-kapur-dim">Jadilah yang pertama memberi ulasan.</p>
          )}
        </div>

        {/* Grid ulasan */}
        {displayed.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="rounded-2xl border border-seduh/20 bg-sayak-800 p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium text-kapur">{r.name}</p>
                  <StarDisplay value={r.rating} size={14} />
                </div>
                {r.comment && <p className="mb-3 text-sm text-kapur-dim">{r.comment}</p>}
                <p className="text-xs text-kapur-dim/60">{relativeDate(r.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
        {reviews.length > 6 && !showAll && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-full border border-kapur/20 px-5 py-2 text-sm text-kapur hover:border-seduh"
            >
              Lihat lebih banyak
            </button>
          </div>
        )}

        {/* Form */}
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-seduh/20 bg-sayak-800 p-6">
          <h3 className="mb-4 font-display text-xl text-kapur">Beri ulasan</h3>

          {success || alreadySent ? (
            <p className="text-sm text-daun">
              {alreadySent && !success
                ? "Kamu sudah memberi ulasan hari ini. Terima kasih!"
                : "Terima kasih! Ulasanmu akan tampil setelah disetujui admin."}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* honeypot */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
              </div>

              <div>
                <label htmlFor="review-name" className="mb-1 block text-sm text-kapur-dim">Nama</label>
                <input
                  id="review-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  placeholder="Cukup nama depan"
                  className="field"
                  disabled={sending}
                />
              </div>

              <div>
                <p className="mb-1 text-sm text-kapur-dim">Bintang</p>
                <StarInput value={rating} onChange={setRating} disabled={sending} />
              </div>

              <div>
                <label htmlFor="review-comment" className="mb-1 block text-sm text-kapur-dim">
                  Komentar <span className="text-kapur-dim/60">(opsional)</span>
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Ceritakan pengalamanmu…"
                  className="field resize-none"
                  disabled={sending}
                />
                <p className="mt-1 text-right text-xs tabular-nums text-kapur-dim/50">{comment.length}/300</p>
              </div>

              {formError && <p role="alert" className="text-sm text-red-300">{formError}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-seduh py-3 text-sm font-medium text-sayak-900 transition-colors hover:bg-seduh-light disabled:opacity-60"
              >
                {sending ? "Mengirim…" : "Kirim ulasan"}
              </button>

              <p className="text-xs text-kapur-dim/60">
                Cukup nama depan sudah cukup. Ulasanmu akan tampil setelah disetujui admin.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
