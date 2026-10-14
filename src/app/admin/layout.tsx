import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Admin — Kedai Kawa Daun",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-sayak-900">{children}</div>;
}
