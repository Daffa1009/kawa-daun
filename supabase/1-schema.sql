-- =====================================================================
--  KEDAI KAWA DAUN — SKEMA DATABASE  (LANGKAH 1)
--  Tempel SELURUH isi file ini ke Supabase -> SQL Editor -> New query -> Run
--  Aman dijalankan berulang kali.
-- =====================================================================

-- ---------- 1. TABEL ----------

-- Pengaturan kedai (hanya boleh ada 1 baris, id = 1)
create table if not exists public.shop_settings (
  id          int primary key default 1 check (id = 1),
  status_mode text not null default 'auto' check (status_mode in ('auto','open','closed')),
  open_hour   int  not null default 10 check (open_hour between 0 and 23),
  close_hour  int  not null default 22 check (close_hour between 1 and 24),
  address     text not null default '',
  instagram   text not null default '',
  updated_at  timestamptz not null default now()
);

-- Daftar menu
create table if not exists public.menu_items (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  tagline     text not null default '',
  description text not null default '',
  price       integer not null check (price >= 0),
  image       text not null default '',
  spices      text[] not null default '{}',
  badge       text,
  sold_out    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Daftar akun yang boleh mengubah data (admin)
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- 2. FUNGSI BANTU ----------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_menu_items_updated on public.menu_items;
create trigger trg_menu_items_updated before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_shop_settings_updated on public.shop_settings;
create trigger trg_shop_settings_updated before update on public.shop_settings
  for each row execute function public.set_updated_at();

-- Apakah pengguna yang sedang login adalah admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- 3. KEAMANAN (Row Level Security) ----------
-- Semua orang boleh MEMBACA menu & status kedai.
-- Hanya admin yang boleh MENGUBAH.

alter table public.shop_settings enable row level security;
alter table public.menu_items    enable row level security;
alter table public.admins        enable row level security;

drop policy if exists "settings_read_all"   on public.shop_settings;
drop policy if exists "settings_admin_write" on public.shop_settings;
create policy "settings_read_all" on public.shop_settings
  for select to anon, authenticated using (true);
create policy "settings_admin_write" on public.shop_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_read_all"    on public.menu_items;
drop policy if exists "menu_admin_write" on public.menu_items;
create policy "menu_read_all" on public.menu_items
  for select to anon, authenticated using (true);
create policy "menu_admin_write" on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin hanya boleh melihat barisnya sendiri; tidak ada policy tulis
-- (admin baru hanya bisa ditambah lewat SQL Editor, langkah 2).
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------- 4. DATA AWAL ----------

insert into public.shop_settings (id, status_mode, open_hour, close_hour, address, instagram)
values (1, 'auto', 10, 22, 'Jl. Contoh No. 12, Sumatera Barat', '@kedaikawadaun')
on conflict (id) do nothing;

insert into public.menu_items (id, name, tagline, description, price, image, spices, badge, sold_out, sort_order)
values
  ('kawa-ori', 'Kawa Daun Ori', 'Seduhan paling jujur',
   'Daun kopi asap diseduh bersama jahe dan kayu manis, disajikan hangat dalam sayak tanpa tambahan apa pun.',
   15000, '/images/menu-ori.jpg', array['Daun kopi','Jahe','Kayu manis'], 'Terlaris', false, 1),
  ('kawa-susu', 'Kawa Daun Susu', 'Lembut di tenggorokan',
   'Seduhan ori dengan susu kental manis yang mengurangi rasa sepat. Cocok untuk yang baru pertama mencoba.',
   18000, '/images/menu-susu.jpg', array['Daun kopi','Susu','Cengkeh'], 'Favorit', false, 2),
  ('kawa-telur', 'Kawa Daun Telur', 'Kocokan kuning telur',
   'Kuning telur ayam kampung dikocok dengan gula aren, lalu disiram seduhan panas. Kaya dan menghangatkan badan.',
   22000, '/images/menu-telur.jpg', array['Daun kopi','Telur','Gula aren'], null, true, 3)
on conflict (id) do nothing;

-- ---------- 5. PENYIMPANAN FOTO MENU (Storage) ----------

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

drop policy if exists "menu_images_admin_insert" on storage.objects;
drop policy if exists "menu_images_admin_update" on storage.objects;
drop policy if exists "menu_images_admin_delete" on storage.objects;

create policy "menu_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu-images' and public.is_admin());
create policy "menu_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'menu-images' and public.is_admin());
create policy "menu_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu-images' and public.is_admin());

-- ---------- 6. REALTIME (website pelanggan update otomatis) ----------

do $$ begin
  alter publication supabase_realtime add table public.menu_items;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.shop_settings;
exception when duplicate_object then null; end $$;
