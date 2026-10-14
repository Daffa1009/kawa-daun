import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kedai Kawa Daun — Warisan Kuliner Otentik Minangkabau",
  description:
    "Kawa daun, seduhan daun kopi tradisional Minangkabau yang disajikan dalam tempurung kelapa. Kenali ceritanya dan pesan langsung lewat WhatsApp.",
  openGraph: {
    title: "Kedai Kawa Daun",
    description: "Warisan Kuliner Otentik Minangkabau",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A0F0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
