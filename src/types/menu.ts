export type MenuItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Harga dalam rupiah (angka bulat) */
  price: number;
  image: string;
  /** Rempah / bahan utama, tampil sebagai chip di card */
  spices: string[];
  /** Label opsional di pojok gambar, mis. "Favorit" */
  badge?: string;
  /** true = tampil grayscale, teks "Habis", tombol pesan nonaktif */
  soldOut: boolean;
  /** Urutan tampil (dari database) */
  sortOrder?: number;
};

export type OrderType = "Ambil di kedai" | "Minum di tempat" | "Antar";

export type PaymentMethod = "Tunai" | "QRIS";
