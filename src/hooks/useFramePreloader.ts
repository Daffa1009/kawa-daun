"use client";

import { useEffect, useRef, useState } from "react";
import { framePath } from "@/lib/constants";

/**
 * Preload seluruh frame ke memori browser.
 * - `imagesRef.current[i]` berisi HTMLImageElement yang sudah ter-decode.
 * - `progress` 0..1 untuk loading bar.
 * - `ready` true saat semua frame selesai (sukses atau gagal).
 */
export function useFramePreloader(total: number) {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let count = 0;
    imagesRef.current = new Array(total);

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          imagesRef.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve(); // frame hilang tidak boleh menahan halaman
        img.src = framePath(i);
      }).then(() => {
        if (cancelled) return;
        count += 1;
        setLoaded(count);
      });

    for (let i = 0; i < total; i++) loadOne(i);

    return () => {
      cancelled = true;
    };
  }, [total]);

  return {
    imagesRef,
    progress: total === 0 ? 1 : loaded / total,
    ready: loaded >= total,
  };
}
