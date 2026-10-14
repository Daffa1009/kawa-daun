"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Dashboard } from "./Dashboard";
import { LoginForm } from "./LoginForm";
import { SetupNotice } from "./SetupNotice";

export default function AdminApp() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return <AdminGate />;
}

function AdminGate() {
  const sb = getSupabase()!;
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const userId = session?.user.id;

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [sb]);

  // Cek apakah akun ini terdaftar di tabel `admins`
  useEffect(() => {
    if (!userId) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    sb.from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [sb, userId]);

  if (authLoading) return <p className="text-center text-kapur-dim">Memuat…</p>;
  if (!session) return <LoginForm sb={sb} />;
  if (isAdmin === null) return <p className="text-center text-kapur-dim">Memeriksa akses…</p>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-400/30 bg-sayak-800 p-8 text-center">
        <h1 className="font-display text-2xl text-kapur">Akun belum menjadi admin</h1>
        <p className="mt-3 text-sm text-kapur-dim">
          {session.user.email} belum terdaftar di tabel <code className="text-seduh-light">admins</code>.
          Jalankan SQL langkah 2 di Supabase untuk mendaftarkannya.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => sb.auth.signOut()}>
          Keluar
        </Button>
      </div>
    );
  }

  return <Dashboard sb={sb} email={session.user.email ?? ""} />;
}
