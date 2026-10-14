import { cn } from "@/lib/utils";

/**
 * Pembatas bermotif pucuk rabung (tunas bambu) — motif klasik ukiran/songket
 * Minangkabau. Pola dibuat murni dengan CSS (lihat `.ukiran` di globals.css).
 */
export function Ukiran({ className }: { className?: string }) {
  return <div aria-hidden className={cn("ukiran h-3 w-full", className)} />;
}
