/**
 * ==== PENTING ====
 * FRAME_COUNT = jumlah gambar di /public/frames.
 * Folder ini berisi frame_000.webp ... frame_031.webp  => 32 frame (dari kawa-frames-detik3-7.zip).
 * Jika Anda mengganti/menambah frame, ubah angka ini.
 */
export const FRAME_COUNT = 32;
export const FRAME_DIR = "/frames";

export const framePath = (index: number) =>
  `${FRAME_DIR}/frame_${String(index).padStart(3, "0")}.webp`;

export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
