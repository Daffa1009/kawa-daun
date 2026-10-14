export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-seduh/30 bg-sayak-800 p-8">
      <h1 className="font-display text-2xl text-kapur">Supabase belum tersambung</h1>
      <p className="mt-3 text-sm leading-relaxed text-kapur-dim">
        Halaman admin butuh database. Buka file <code className="text-seduh-light">.env.local</code> di
        folder proyek, lalu tempel dua nilai ini dari Supabase Dashboard → Project Settings → API:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-sayak-900 p-4 text-xs text-kapur">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
      </pre>
      <p className="mt-4 text-sm text-kapur-dim">
        Setelah disimpan, hentikan dan jalankan ulang <code className="text-seduh-light">npm run dev</code>.
      </p>
    </div>
  );
}
