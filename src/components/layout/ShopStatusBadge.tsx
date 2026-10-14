"use client";

import { useShopStatus } from "@/hooks/useShopStatus";
import { cn } from "@/lib/utils";

export function ShopStatusBadge({ className }: { className?: string }) {
  const status = useShopStatus();

  // Placeholder dengan ukuran sama agar layout tidak melompat saat hydrate
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex h-8 w-[7.5rem] rounded-full border border-kapur/10 bg-kapur/5",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <span
      role="status"
      title={`Jam buka ${status.hours}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
        status.isOpen
          ? "border-daun/40 bg-daun/10 text-[#B5D88A]"
          : "border-red-400/30 bg-red-500/10 text-red-300",
        className,
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        {status.isOpen && (
          <span className="absolute inset-0 animate-pulseRing rounded-full bg-daun" />
        )}
        <span
          className={cn(
            "relative h-2.5 w-2.5 rounded-full",
            status.isOpen ? "bg-daun" : "bg-red-400",
          )}
        />
      </span>
      {status.label}
    </span>
  );
}
