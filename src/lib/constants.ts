/**
 * ==== PENTING ====
 * FRAME_COUNT = jumlah gambar di /public/frames.
 * Folder ini berisi frame_000.jpg ... frame_059.jpg  => 60 frame.
 * Jika Anda mengganti/menambah frame, ubah angka ini.
 */
export const FRAME_COUNT = 60;
export const FRAME_DIR = "/frames";

export const framePath = (index: number) =>
  `${FRAME_DIR}/frame_${String(index).padStart(3, "0")}.jpg`;

export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
