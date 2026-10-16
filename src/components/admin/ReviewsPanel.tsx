"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";
import { deleteReview, fetchAllReviews, setReviewStatus } from "@/lib/supabase/api";
import type { Review, ReviewStatus } from "@/types/review";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn("shrink-0", i < value ? "fill-seduh-light text-seduh-light" : "text-kapur/20")}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}

export function ReviewsPanel({
  sb,
  notify,
}: {
  sb: SupabaseClient;
  notify: (type: "ok" | "err", text: string) => void;
}) {
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [reviews, setReviews] = useState<Review[] | null>(null);

  const load = async () => {
    try {
      const all = await fetchAllReviews(sb);
      setReviews(all);
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Gagal memuat ulasan.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sb]);

  const filtered =
    filter === "all" ? reviews : reviews?.filter((r) => r.status === filter);

  const counts = reviews
    ? {
        all: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        approved: reviews.filter((r) => r.status === "approved").length,
        rejected: reviews.filter((r) => r.status === "rejected").length,
      }
    : null;

  const handleStatus = async (id: string, status: ReviewStatus) => {
    try {
      await setReviewStatus(sb, id, status);
      setReviews((cur) => cur?.map((r) => (r.id === id ? { ...r, status } : r)) ?? cur);
      notify("ok", status === "approved" ? "Ulasan disetujui." : "Ulasan ditolak.");
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Gagal mengubah status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus ulasan ini?")) return;
    try {
      await deleteReview(sb, id);
      setReviews((cur) => cur?.filter((r) => r.id !== id) ?? cur);
      notify("ok", "Ulasan dihapus.");
    } catch (e) {
      notify("err", e instanceof Error ? e.message : "Gagal menghapus.");
    }
  };

  if (reviews === null) return <p className="text-sm text-kapur-dim">Memuat ulasan…</p>;

  return (
    <section className="rounded-2xl border border-seduh/20 bg-sayak-800 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-kapur">Ulasan pelanggan</h2>
        {counts && (
          <span className="text-xs text-kapur-dim">
            {counts.pending} menunggu
            {counts.pending > 0 && " • perlu ditinjau"}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === s
                ? "border-seduh bg-seduh text-sayak-900"
                : "border-kapur/15 text-kapur-dim hover:border-seduh/40",
            )}
          >
            {s === "all" ? "Semua" : STATUS_LABEL[s]}
            {counts && ` (${counts[s]})`}
          </button>
        ))}
      </div>

      {!filtered || filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-kapur-dim">
          {filter === "pending" ? "Tidak ada ulasan menunggu." : "Belum ada ulasan."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-xl border border-kapur/10 bg-sayak-900/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-kapur">{r.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars value={r.rating} />
                    <span className="text-xs text-kapur-dim/60">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        r.status === "pending" && "bg-amber-500/20 text-amber-300",
                        r.status === "approved" && "bg-emerald-500/20 text-emerald-300",
                        r.status === "rejected" && "bg-red-500/20 text-red-300",
                      )}
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm text-kapur-dim">{r.comment}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => handleStatus(r.id, "approved")}
                    className="rounded-full bg-daun px-3 py-1 text-xs font-medium text-sayak-900 hover:bg-daun/90"
                  >
                    Setujui
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => handleStatus(r.id, "rejected")}
                    className="rounded-full border border-kapur/15 px-3 py-1 text-xs text-kapur hover:border-red-400/40"
                  >
                    Tolak
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
