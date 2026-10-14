-- =====================================================================
--  DAFTARKAN AKUN ADMIN  (LANGKAH 2 — jalankan SETELAH membuat user)
--  1. Supabase -> Authentication -> Users -> Add user -> Create new user
--     isi email + kata sandi, centang "Auto Confirm User".
--  2. Ganti email di bawah dengan email tadi, lalu Run.
-- =====================================================================

insert into public.admins (user_id)
select id from auth.users where email = 'GANTI_DENGAN_EMAIL_ADMIN_ANDA'
on conflict (user_id) do nothing;

-- Pengecekan: harus muncul 1 baris
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
