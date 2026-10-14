"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { DEFAULT_SETTINGS } from "@/data/shop";
import { formatHours } from "@/lib/shop";
import { getSupabase } from "@/lib/supabase/client";
import { fetchSettings } from "@/lib/supabase/api";
import type { ShopSettings } from "@/types/shop";

function waDisplay(phone: string) {
  // 6281234567890 -> +62 812-3456-7890 (best effort)
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("62")) return `+${d.slice(0, 2)} ${d.slice(2, 5)}-${d.slice(5, 9)}-${d.slice(9)}`.replace(/-+$/, "").replace(/ +$/, "");
  return phone;
}

export default function LocationSection() {
  const reduce = useReducedMotion();
  const [s, setS] = useState<ShopSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    fetchSettings(sb).then((row) => {
      if (row) setS(row);
    }).catch(() => {});
    // realtime: update if admin changes settings
    const ch = sb.channel("location-settings")
      .on("postgres_changes", { event: "*", schema: "public", table: "shop_settings" }, (payload) => {
        // fetch again to use mapper fallback logic
        fetchSettings(sb).then((row) => { if (row) setS(row); }).catch(() => {});
      })
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);

  const embedSrc = s.mapEmbedSrc || DEFAULT_SETTINGS.mapEmbedSrc;
  const mapLink = s.mapLink || DEFAULT_SETTINGS.mapLink;
  const phoneDigits = s.phone.replace(/\D/g, "") || DEFAULT_SETTINGS.phone;

  return (
    <section id="lokasi" className="relative overflow-hidden bg-sayak-900 py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[520px] rounded-full bg-seduh/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-seduh/30 bg-seduh/10 px-4 py-1.5 text-xs font-medium tracking-wide text-seduh-light">
            📍 Lokasi Kedai & Virtual Tour
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-kapur sm:text-4xl md:text-5xl">
            Mampir & Rasakan <span className="text-seduh-light">Hangatnya</span> Kawa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-kapur-dim sm:text-base">
            Nongkrong di saung bambu dengan angin sawah, ditemani aroma kawa daun yang baru diseduh dalam sayak.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8"
          >
            <ul className="space-y-6">
              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-seduh/15 text-seduh-light">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-kapur">Alamat</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-kapur-dim">{s.address}</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-seduh/15 text-seduh-light">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-kapur">Jam Buka</p>
                  <p className="mt-1 text-sm leading-relaxed text-kapur-dim">
                    Setiap hari, {formatHours(s.openHour, s.closeHour)}
                    <br />
                    <span className="text-seduh-light">Weekend & hari libur tetap buka</span>
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-seduh/15 text-seduh-light">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-kapur">Reservasi & WhatsApp</p>
                  <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-kapur-dim hover:text-seduh-light hover:underline">
                    {waDisplay(phoneDigits)}
                  </a>
                </div>
              </li>
            </ul>

            <div className="mt-6 rounded-xl bg-sayak-800/60 p-4">
              <p className="text-sm leading-relaxed text-kapur/80">
                Suasana saung kayu terbuka menghadap hamparan sawah dan perbukitan. Cocok untuk ngobrol santai, kerja
                remote, atau sekadar menyeruput kawa daun hangat di sore hari.
              </p>
            </div>

            <a href={mapLink} target="_blank" rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-seduh px-6 py-3.5 text-sm font-semibold text-sayak-900 shadow-[0_10px_30px_rgba(200,120,42,0.35)] transition hover:bg-seduh-light hover:shadow-[0_14px_36px_rgba(200,120,42,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seduh-light">
              <Navigation size={16} />
              Buka Petunjuk Arah di Google Maps
            </a>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-sayak-800 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-[4/3] w-full lg:aspect-[4/3.4]">
              {embedSrc ? (
                <iframe
                  key={embedSrc}
                  title="Peta Lokasi Kedai Kawa Daun"
                  src={embedSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-kapur-dim">
                  Embed Maps belum diatur. Atur di Admin → Embed URL Google Maps.
                </div>
              )}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            </div>
            <div className="flex items-center justify-between bg-sayak-900/80 px-4 py-3 backdrop-blur">
              <p className="text-xs text-kapur-dim">Geser & zoom untuk eksplor sekitar kedai</p>
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-seduh-light hover:underline">
                Street View ↗
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
