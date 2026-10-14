"use client";

import { useEffect, useState } from "react";
import { useShopData } from "@/components/providers/ShopDataProvider";
import { computeShopStatus } from "@/lib/shop";
import type { ShopStatus } from "@/types/shop";

export type { ShopStatus };

/** `null` saat SSR / sebelum hydrate agar tidak terjadi mismatch. */
export function useShopStatus(): ShopStatus | null {
  const { settings } = useShopData();
  const [status, setStatus] = useState<ShopStatus | null>(null);

  useEffect(() => {
    setStatus(computeShopStatus(settings));
    const id = setInterval(() => setStatus(computeShopStatus(settings)), 60_000);
    return () => clearInterval(id);
  }, [settings]);

  return status;
}
