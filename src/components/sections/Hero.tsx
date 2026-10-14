"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAME_COUNT, EASE_OUT_EXPO } from "@/lib/constants";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { clamp } from "@/lib/utils";

/**
 * Pada progres scroll berapa teks hero mulai memudar (0..1).
 * 0.7 = teks tetap tampil sampai ±70% animasi, lalu memudar & naik
 * perlahan saat frame mencapai akhir.
 */
const TEXT_FADE_START = 0.7;

const fadeUp = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, delay, ease: EASE_OUT_EXPO },
  },
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const currentFrame = useRef(0);

  const reduceMotion = useReducedMotion();
  const { imagesRef, progress, ready } = useFramePreloader(FRAME_COUNT);

  /** Gambar 1 frame ke canvas dengan logika "object-cover". */
  const render = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      currentFrame.current = index;

      // Pakai frame terdekat yang sudah termuat (aman bila ada frame gagal load)
      let img: HTMLImageElement | undefined;
      for (let i = index; i >= 0 && !img; i--) img = imagesRef.current[i];
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    },
    [imagesRef],
  );

  /** Sinkronkan resolusi canvas dengan ukuran CSS × devicePixelRatio. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(currentFrame.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [render, ready]);

  /** Scrub frame + fade teks memakai GSAP ScrollTrigger. */
  useEffect(() => {
    if (!ready || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const applyOverlay = (p: number) => {
      const t = clamp((p - TEXT_FADE_START) / (1 - TEXT_FADE_START));
      if (textRef.current) {
        textRef.current.style.opacity = String(1 - t);
        textRef.current.style.transform = `translate3d(0, ${-t * 90}px, 0)`;
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - clamp(p / 0.06));
      }
      if (curtainRef.current) {
        curtainRef.current.style.opacity = String(t * 0.75);
      }
    };

    const state = { frame: 0 };
    render(0);
    applyOverlay(0);

    const ctx = gsap.context(() => {
      gsap.to(state, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => render(state.frame),
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduceMotion ? true : 0.5, // 0.5 detik "inersia" agar halus
          onUpdate: (self) => applyOverlay(self.progress),
          onRefresh: (self) => applyOverlay(self.progress),
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [ready, render, reduceMotion]);

  const state = ready ? "show" : "hidden";

  return (
    <section ref={sectionRef} id="beranda" className="relative h-[300vh]">
      {/* Area sticky 100vw × 100vh yang berisi canvas + overlay */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-sayak-900">
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />

        {/* Overlay semi-transparan: vignette + gradasi atas/bawah */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,15,10,0.15)_0%,rgba(26,15,10,0.55)_75%,rgba(18,10,6,0.85)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sayak/60 via-transparent to-sayak/90"
        />
        {/* Tirai gelap untuk transisi halus ke section berikutnya */}
        <div
          ref={curtainRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-sayak opacity-0"
        />

        {/* Teks hero */}
        <div
          ref={textRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <motion.h1
            variants={fadeUp(0.15)}
            initial="hidden"
            animate={state}
            className="font-display text-[length:clamp(2.6rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-[0.04em] text-kapur [text-shadow:0_4px_40px_rgba(18,10,6,0.85)]"
          >
            KEDAI
            <br />
            KAWA DAUN
          </motion.h1>

          <motion.p
            variants={fadeUp(0.8)}
            initial="hidden"
            animate={state}
            className="mt-8 max-w-md text-base text-kapur/90 [text-shadow:0_2px_20px_rgba(18,10,6,0.9)] sm:text-lg"
          >
            Warisan Kuliner Otentik Minangkabau
          </motion.p>
        </div>

        {/* Petunjuk scroll */}
        <div
          ref={hintRef}
          className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
        >
          <motion.p
            variants={fadeUp(1.4)}
            initial="hidden"
            animate={state}
            className="animate-nudge text-sm tracking-wide text-kapur/80"
          >
            ↓ Scroll ke Bawah
          </motion.p>
        </div>

        {/* Loading preloader */}
        <div
          role="status"
          aria-live="polite"
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-sayak-900 transition-opacity duration-700 ${
            ready ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <p className="font-display text-xl text-kapur">Menyeduh kawa…</p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-kapur/10">
            <div
              className="h-full rounded-full bg-seduh transition-[width] duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs tabular-nums text-kapur-dim">
            {Math.round(progress * 100)}%
          </p>
        </div>
      </div>
    </section>
  );
}
