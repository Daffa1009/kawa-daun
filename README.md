# Kedai Kawa Daun — Frontend UI

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · GSAP ScrollTrigger · Lucide.
Tahap ini fokus ke **UI dengan data dummy**. Supabase menyusul.

## Menjalankan

```bash
npm install
# isi .env.local dengan kunci Supabase (lihat bagian "Menyambung Supabase")
npm run dev                    # http://localhost:3000
```

Build produksi: `npm run build && npm start`.

## Yang WAJIB Anda sesuaikan

| Apa | Di mana |
| --- | --- |
| **Jumlah frame** (`FRAME_COUNT`) | `src/lib/constants.ts` — sekarang **60** (frame_000 … frame_059) |
| Nomor WhatsApp (sekarang `6283867313698`) | `src/data/shop.ts` → `SHOP.whatsapp` |
| Alamat, jam buka, Instagram, menu & harga | lewat **/admin** (atau SQL seed di `supabase/1-schema.sql`) |
| Naskah cerita sejarah | `src/data/story.ts` (naskah awal hanya contoh, sesuaikan dengan riset Anda) |
| Foto menu | ganti `public/images/menu-*.jpg` (sekarang masih crop dari frame animasi) |

Jika frame Anda diganti, gunakan skrip bantu:

```bash
node scripts/rename-frames.mjs path/ke/folder/ezgif-frames
```

## Struktur folder

```
public/
  frames/            frame_000.jpg … frame_059.jpg  (urutan animasi hero)
  images/            potongan rempah (PNG transparan), tempurung, foto menu
src/
  app/
    layout.tsx       font, metadata, CartProvider, Navbar, keranjang
    page.tsx         Hero → Story → Menu → Footer
    globals.css      tema, motif ukiran, reduced-motion
  components/
    layout/          Navbar, ShopStatusBadge, Footer
    sections/        Hero (canvas + GSAP), StorySection (parallax Framer Motion)
    menu/            MenuCatalog, MenuCard (termasuk varian "Habis")
    cart/            CartProvider (state), CartDrawer, FloatingCartButton
    ui/              Button, Logo, Ukiran (pembatas motif pucuk rabung)
  data/              menu.ts, shop.ts, story.ts  ← data dummy
  hooks/             useFramePreloader, useShopStatus
  lib/               constants, utils, whatsapp (generator pesan wa.me)
  types/             menu.ts
```

## Cara kerja singkat

**Hero** — `Hero.tsx` memuat semua frame ke memori (`useFramePreloader`) dengan loading bar,
lalu GSAP ScrollTrigger men-*scrub* indeks frame terhadap scroll pada area setinggi `300vh`.
Canvas digambar dengan logika *object-cover* dan memperhitungkan `devicePixelRatio`.
Teks memudar & naik pelan saat progres melewati `TEXT_FADE_START` (default 0.7, ubah di file yang sama).

**Story** — Framer Motion `useScroll` + `useTransform`: tiap rempah punya jarak geser & rotasi
berbeda (efek kedalaman) plus gerak melayang pelan. Pengguna dengan *reduced motion* otomatis tidak
mendapat gerakan.

**Status kedai** — `useShopStatus` menghitung buka/tutup dari jam di `data/shop.ts` (zona WIB).
Paksa status lewat `forceStatus: "open" | "closed"`.

**Sold out** — set `soldOut: true` di `data/menu.ts`: gambar grayscale, cap "Habis",
tombol nonaktif, dan item tidak bisa masuk keranjang (dijaga juga di reducer).

**WhatsApp** — `lib/whatsapp.ts` menyusun pesan terformat dan link `wa.me`. Dipakai oleh
tombol ikon WhatsApp di tiap card (1 porsi langsung) dan tombol "Pesan via WhatsApp" di keranjang.

## Menyambung Supabase

1. Buat project di supabase.com.
2. SQL Editor → New query → tempel isi `supabase/1-schema.sql` → **Run**.
3. Authentication → Users → **Add user** → buat email + kata sandi admin (centang *Auto Confirm User*).
4. SQL Editor → tempel `supabase/2-daftar-admin.sql` (ganti emailnya) → **Run**.
5. Project Settings → API → salin **Project URL** dan **anon / publishable key** ke `.env.local`.
6. Restart `npm run dev`, buka `http://localhost:3000/admin`, lalu masuk.

Tanpa kunci di `.env.local`, website tetap jalan dengan data dummy dan `/admin` menampilkan petunjuk setup.

### Fitur admin (`/admin`)
- Saklar status kedai: **Otomatis** (ikut jam buka) / **Buka sekarang** / **Tutup sekarang**.
- Ubah jam buka-tutup, alamat, Instagram.
- Saklar **Tersedia / Habis** per menu, tambah, edit (termasuk upload foto), dan hapus menu.
- Perubahan tampil realtime di website pelanggan. Keamanan dijaga Row Level Security: semua orang hanya bisa
  membaca, hanya akun di tabel `admins` yang bisa menulis.

## Catatan

- Komponen UI ditulis sendiri dengan Tailwind (tanpa dependensi shadcn/ui) agar ringan; `cn()` di
  `lib/utils.ts` kompatibel bila Anda ingin menambahkan shadcn/ui nanti.
- Jangan pernah menempel kunci `service_role` di proyek ini.
- Font (Fraunces & Hanken Grotesk) dimuat via `next/font/google` — butuh internet saat `npm run build`.
