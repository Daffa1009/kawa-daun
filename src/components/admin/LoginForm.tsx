"use client";

import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

export function LoginForm({ sb }: { sb: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("Email atau kata sandi salah.");
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-seduh/25 bg-sayak-800 p-8">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <span className="font-display text-xl text-kapur">Masuk Admin</span>
      </div>
      <p className="mt-2 text-sm text-kapur-dim">Khusus pemilik Kedai Kawa Daun.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-kapur-dim">Email</label>
          <input id="email" type="email" required autoComplete="username" value={email}
            onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-kapur-dim">Kata sandi</label>
          <input id="password" type="password" required autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} className="field" />
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Memeriksa…" : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
