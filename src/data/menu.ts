import type { MenuItem } from "@/types/menu";

/**
 * DATA DUMMY — nanti diganti dengan fetch dari Supabase.
 * Cukup ubah `soldOut` untuk melihat variasi UI "Habis".
 */
export const MENU: MenuItem[] = [
  {
    id: "kawa-ori",
    name: "Kawa Daun Ori",
    tagline: "Seduhan paling jujur",
    description:
      "Daun kopi asap diseduh bersama jahe dan kayu manis, disajikan hangat dalam sayak tanpa tambahan apa pun.",
    price: 15000,
    image: "/images/menu-ori.jpg",
    spices: ["Daun kopi", "Jahe", "Kayu manis"],
    badge: "Terlaris",
    soldOut: false,
  },
  {
    id: "kawa-susu",
    name: "Kawa Daun Susu",
    tagline: "Lembut di tenggorokan",
    description:
      "Seduhan ori dengan susu kental manis yang mengurangi rasa sepat. Cocok untuk yang baru pertama mencoba.",
    price: 18000,
    image: "/images/menu-susu.jpg",
    spices: ["Daun kopi", "Susu", "Cengkeh"],
    badge: "Favorit",
    soldOut: false,
  },
  {
    id: "kawa-telur",
    name: "Kawa Daun Telur",
    tagline: "Kocokan kuning telur",
    description:
      "Kuning telur ayam kampung dikocok dengan gula aren, lalu disiram seduhan panas. Kaya dan menghangatkan badan.",
    price: 22000,
    image: "/images/menu-telur.jpg",
    spices: ["Daun kopi", "Telur", "Gula aren"],
    soldOut: true, // <-- contoh variasi UI "Sold Out"
  },
];

export const getMenuItem = (id: string) => MENU.find((m) => m.id === id);
