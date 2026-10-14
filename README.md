# Kedai Kawa Daun

Website company profile sekaligus web app pemesanan untuk **Kedai Kawa Daun**, UMKM minuman seduhan daun kopi tradisional khas Minangkabau yang disajikan dalam *sayak* (tempurung kelapa).

Website ini punya dua tujuan:

1. **Bercerita.** Mengenalkan sejarah dan budaya kawa daun lewat tampilan sinematik, premium, dan interaktif.
2. **Menjual.** Pelanggan bisa memilih menu, memasukkannya ke keranjang, lalu mengirim pesanan terformat rapi langsung ke WhatsApp kedai. Pemilik kedai mengelola status buka/tutup dan stok lewat panel admin.

---

## Daftar isi

- [Tech stack](#tech-stack)
- [Fitur](#fitur)
- [Struktur folder](#struktur-folder)
- [Cara kerja bagian utama](#cara-kerja-bagian-utama)
- [Catatan keamanan](#catatan-keamanan)

---

## Tech stack

| Kebutuhan | Teknologi |
| --- | --- |
| Framework | **Next.js 14** (App Router) + **React 18** |
| Bahasa | **TypeScript** |
| Styling | **Tailwind CSS 3** (tema warna dan font kustom) |
| Animasi scroll hero | **GSAP** + **ScrollTrigger** dengan **HTML Canvas** |
| Animasi UI & parallax | **Framer Motion** |
| Ikon | **Lucide React** |
| Backend / database | **Supabase** (PostgreSQL, Auth, Storage, Realtime) |
| Utilitas | `clsx` + `tailwind-merge` (fungsi `cn()`) |
| Font | **Fraunces** (judul) dan **Hanken Grotesk** (teks) via `next/font/google` |

Palet warna diambil dari animasi hero: *sayak* (cokelat tua), *seduh* (amber), *kapur* (krem), dan *daun* (hijau).

---

## Fitur

### Halaman pelanggan (`/`)

**Hero sinematik ala Apple**
- 60 frame hasil ekstrak video animasi diputar mengikuti scroll (*scrubbing*) pada area setinggi 300vh.
- Canvas penuh layar dengan logika *object-cover*, jadi gambar tidak gepeng di HP (portrait) maupun desktop (landscape) dan tajam di layar retina.
- Semua frame di-preload ke memori browser dengan loading bar, sehingga animasi mulus tanpa patah-patah.
- Overlay semi-transparan, judul "KEDAI KAWA DAUN" dengan animasi fade-up, lalu teks memudar dan berpindah ke section berikutnya saat animasi selesai.

**Story section dengan parallax**
- Sejarah kawa daun disajikan dalam tiga bab.
- Gambar rempah (jahe, kayu manis, bunga lawang, gula aren, cengkeh) bergerak parallax dengan kecepatan berbeda dan melayang pelan, sehingga terasa berlapis.
- Bingkai tempurung dengan parallax di dalamnya.
- Pembatas bermotif *pucuk rabung* (tunas bambu), motif klasik ukiran Minangkabau.

**Katalog menu interaktif**
- Card menu berbentuk lengkung (mengingatkan pada bentuk tempurung) dengan nama, deskripsi, bahan, label (mis. "Terlaris"), dan harga.
- **Varian Sold Out:** gambar grayscale, cap "Habis", harga dicoret, dan tombol pesan nonaktif. Menu habis juga tidak bisa dimasukkan ke keranjang.
- Tampilan *skeleton* saat data dimuat dan pesan kosong bila belum ada menu.

**Status kedai**
- Badge **Kedai Buka / Kedai Tutup** di navbar dengan indikator berdenyut.
- Status dihitung otomatis dari jam buka (zona WIB), atau dipaksa manual oleh admin.
- Bila kedai tutup, keranjang menampilkan pemberitahuan bahwa pesanan akan dibalas saat buka.

**Keranjang dan pemesanan via WhatsApp**
- Tombol keranjang di navbar (dengan jumlah item) dan **tombol keranjang melayang** yang muncul otomatis saat ada item.
- Panel keranjang: tambah/kurangi/hapus item, total harga, nama pemesan (wajib), jenis pesanan (ambil di kedai / makan di tempat / antar), dan catatan.
- Tombol **"Pesan via WhatsApp"** menyusun pesan terformat dan membuka `wa.me` ke nomor kedai.
- Di setiap card ada tombol ikon WhatsApp untuk memesan **1 porsi langsung** tanpa keranjang.

**Umum**
- Responsif (HP, tablet, desktop), navigasi mobile, dan scroll halus ke anchor.
- Menghormati pengaturan *reduced motion* di perangkat pengguna.
- Fokus keyboard, label ARIA, dan dialog yang bisa ditutup dengan `Esc`.

### Panel admin (`/admin`)

- **Login** dengan email dan kata sandi (Supabase Auth).
- **Status kedai:** pilih *Otomatis* (ikut jam buka), *Buka sekarang*, atau *Tutup sekarang*, serta atur jam buka-tutup, alamat, dan Instagram.
- **Menu dan stok:** saklar **Tersedia / Habis** per menu, tambah menu baru, edit (nama, harga, deskripsi, bahan, label), upload foto, dan hapus menu.
- Pembaruan **realtime**: perubahan di admin langsung tampil di website pelanggan tanpa refresh.
- Halaman admin tidak diindeks mesin pencari (`noindex`).

---

## Struktur folder

```
kedai-kawa-daun/
├── public/
│   ├── frames/                 frame_000.jpg … frame_059.jpg (urutan animasi hero)
│   └── images/                 potongan rempah (PNG transparan), tempurung, foto menu
├── scripts/
│   └── rename-frames.mjs       bantu rename frame ezgif → frame_000.jpg dst.
├── supabase/
│   ├── 1-schema.sql            tabel, keamanan (RLS), data awal, storage, realtime
│   └── 2-daftar-admin.sql      mendaftarkan akun admin
├── src/
│   ├── app/
│   │   ├── layout.tsx          font, metadata dasar
│   │   ├── globals.css         tema, motif ukiran, reduced-motion
│   │   ├── (site)/             halaman pelanggan
│   │   │   ├── layout.tsx      provider data + keranjang, navbar, drawer
│   │   │   └── page.tsx        Hero → Story → Menu → Footer
│   │   └── admin/              halaman admin (/admin)
│   ├── components/
│   │   ├── layout/             Navbar, ShopStatusBadge, Footer
│   │   ├── sections/           Hero (canvas + GSAP), StorySection (parallax)
│   │   ├── menu/               MenuCatalog, MenuCard (termasuk varian "Habis")
│   │   ├── cart/               CartProvider, CartDrawer, FloatingCartButton
│   │   ├── admin/              AdminApp, LoginForm, Dashboard, ShopStatusPanel,
│   │   │                       MenuManager, MenuItemForm, SetupNotice
│   │   ├── providers/          ShopDataProvider (menu + status dari Supabase)
│   │   └── ui/                 Button, Switch, Logo, Ukiran
│   ├── data/                   menu.ts, shop.ts, story.ts (data dummy & cadangan)
│   ├── hooks/                  useFramePreloader, useShopStatus
│   ├── lib/
│   │   ├── supabase/           client, api (query & mutasi), mappers
│   │   ├── constants.ts        FRAME_COUNT, path frame
│   │   ├── shop.ts             logika buka/tutup
│   │   ├── whatsapp.ts         generator pesan & link wa.me
│   │   └── utils.ts            cn(), formatRupiah()
│   └── types/                  menu.ts, shop.ts
├── .env.local                  kunci Supabase (diisi sendiri)
└── tailwind.config.ts
```



## Cara kerja bagian utama

**Hero.** `useFramePreloader` memuat semua frame ke memori. GSAP ScrollTrigger lalu menghubungkan indeks frame dengan progres scroll (`scrub`), dan fungsi `render()` menggambar frame ke canvas dengan perhitungan *cover*. Teks, petunjuk scroll, dan tirai gelap diatur langsung lewat ref agar tidak memicu render ulang React. Titik mulai teks memudar diatur oleh `TEXT_FADE_START` di `Hero.tsx`.

**Parallax.** `useScroll` dan `useTransform` dari Framer Motion memetakan progres scroll section ke pergeseran vertikal dan rotasi. Tiap rempah punya jarak berbeda, ditambah animasi melayang pelan di lapisan dalam.

**Data dan realtime.** `ShopDataProvider` mengambil menu dan pengaturan kedai dari Supabase, lalu berlangganan perubahan tabel (Realtime). Saat admin mengubah sesuatu, halaman pelanggan ikut diperbarui. Bila Supabase belum diatur atau gagal, provider memakai data dummy sebagai cadangan.

**Status buka/tutup.** `computeShopStatus` (`lib/shop.ts`) menghitung status dari mode dan jam buka di zona WIB. Jam buka yang melewati tengah malam juga didukung.

**Pesan WhatsApp.** `lib/whatsapp.ts` menyusun daftar pesanan, total, nama, jenis pesanan, dan catatan menjadi teks, lalu menjadikannya link `https://wa.me/<nomor>?text=…`.

---


## Catatan keamanan

- Keamanan data dijaga **Row Level Security** di database: semua orang hanya bisa membaca menu dan status kedai, sedangkan menulis hanya boleh untuk akun yang terdaftar di tabel `admins`.
- Akun admin hanya bisa ditambahkan lewat SQL Editor Supabase, tidak bisa dari website.


Dibuat dengan Next.js, Framer Motion, GSAP, dan Supabase untuk Kedai Kawa Daun.
