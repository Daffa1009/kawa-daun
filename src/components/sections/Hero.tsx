"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAME_COUNT, EASE_OUT_EXPO } from "@/lib/constants";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { clamp } from "@/lib/utils";

/** Jumlah frame — ubah di src/lib/constants.ts jika ganti aset */
const totalFrames = FRAME_COUNT;

const TEXT_FADE_START = 0.7;

// 0 = frame utuh (contain), 1 = cover seperti sekarang. Naikkan mis. 0.3 bila ingin sedikit lebih besar dengan sedikit pemotongan.
const PORTRAIT_FIT = 0;
// bila rasio canvas (cw / ch) di bawah angka ini, layar dianggap potret/hampir persegi
const PORTRAIT_BREAKPOINT = 1.1;

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
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const reduceMotion = useReducedMotion();
  const { imagesRef, progress, ready } = useFramePreloader(totalFrames);

  const render = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      currentFrame.current = index;

      let img: HTMLImageElement | undefined;
      for (let i = index; i >= 0 && !img; i--) img = imagesRef.current[i];
      if (!img || !img.naturalWidth) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const logicalW = canvas.width / dpr;
      const logicalH = canvas.height / dpr;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const cover = Math.max(logicalW / iw, logicalH / ih);
      const contain = Math.min(logicalW / iw, logicalH / ih);
      const isPortrait = logicalW / logicalH < PORTRAIT_BREAKPOINT;
      const scale = isPortrait ? contain + (cover - contain) * PORTRAIT_FIT : cover;

      if (isPortrait) {
        // --- blur fill via small offscreen canvas (Safari-safe, no ctx.filter) ---
        if (!blurCanvasRef.current) blurCanvasRef.current = document.createElement("canvas");
        const bCanvas = blurCanvasRef.current;
        const bw = 48;
        const bh = Math.max(1, Math.round(bw * (logicalH / logicalW)));
        if (bCanvas.width !== bw || bCanvas.height !== bh) {
          bCanvas.width = bw;
          bCanvas.height = bh;
        }
        const bctx = bCanvas.getContext("2d");
        if (bctx) {
          bctx.setTransform(1, 0, 0, 1, 0, 0);
          bctx.clearRect(0, 0, bw, bh);
          bctx.imageSmoothingEnabled = true;
          bctx.imageSmoothingQuality = "high";
          const bScale = Math.max(bw / iw, bh / ih);
          const bW = iw * bScale;
          const bH = ih * bScale;
          bctx.drawImage(img, (bw - bW) / 2, (bh - bH) / 2, bW, bH);
        }
        // stretch small canvas to full — creates blur
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bCanvas, 0, 0, logicalW, logicalH);
        ctx.fillStyle = "rgba(18,10,6,0.45)";
        ctx.fillRect(0, 0, logicalW, logicalH);
      }

      const w = iw * scale;
      const h = ih * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (logicalW - w) / 2, (logicalH - h) / 2, w, h);
    },
    [imagesRef],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Spec: canvas.width = innerWidth * dpr — but use client size to respect sticky container
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      // Also fallback to window if client is 0 on first paint
      canvas.width = w || Math.round(window.innerWidth * dpr);
      canvas.height = h || Math.round(window.innerHeight * dpr);
      render(currentFrame.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // DPR can change when moving window between screens
    const mql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDprChange = () => resize();
    // @ts-ignore - older Safari uses addListener
    mql.addEventListener ? mql.addEventListener("change", onDprChange) : mql.addListener(onDprChange);
    window.addEventListener("resize", resize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
      // @ts-ignore
      mql.removeEventListener ? mql.removeEventListener("change", onDprChange) : mql.removeListener(onDprChange);
    };
  }, [render, ready]);

  useEffect(() => {
    if (!ready || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const applyOverlay = (p: number) => {
      const t = clamp((p - TEXT_FADE_START) / (1 - TEXT_FADE_START));
      if (textRef.current) {
        textRef.current.style.opacity = String(1 - t);
        textRef.current.style.transform = `translate3d(0, ${-t * 90}px, 0)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp(p / 0.06));
      if (curtainRef.current) curtainRef.current.style.opacity = String(t * 0.75);
    };

    const state = { frame: 0 };
    render(0);
    applyOverlay(0);

    const ctx = gsap.context(() => {
      gsap.to(state, {
        frame: totalFrames - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => render(Math.round(state.frame)),
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: reduceMotion ? true : 0.5,
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
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-sayak-900">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,15,10,0.15)_0%,rgba(26,15,10,0.55)_75%,rgba(18,10,6,0.85)_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sayak/60 via-transparent to-sayak/90" />
        <div ref={curtainRef} aria-hidden className="pointer-events-none absolute inset-0 bg-sayak opacity-0" />

        <div ref={textRef} className="absolute inset-0 z-10 flex flex-col items-center px-6 text-center will-change-transform justify-start pt-[22svh] md:justify-center md:pt-0">
          <motion.h1 variants={fadeUp(0.15)} initial="hidden" animate={state} className="font-display text-[length:clamp(2.6rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-[0.04em] text-kapur [text-shadow:0_4px_40px_rgba(18,10,6,0.85)]">
            KEDAI
            <br />
            KAWA DAUN
          </motion.h1>
          <motion.p variants={fadeUp(0.8)} initial="hidden" animate={state} className="mt-8 max-w-md text-base text-kapur/90 [text-shadow:0_2px_20px_rgba(18,10,6,0.9)] sm:text-lg">
            Warisan Kuliner Otentik Minangkabau
          </motion.p>
        </div>

        <div ref={hintRef} className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <motion.p variants={fadeUp(1.4)} initial="hidden" animate={state} className="animate-nudge text-sm tracking-wide text-kapur/80">
            ↓ Scroll ke Bawah
          </motion.p>
        </div>

        <div role="status" aria-live="polite" className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-sayak-900 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <p className="font-display text-xl text-kapur">Menyeduh kawa…</p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-kapur/10">
            <div className="h-full rounded-full bg-seduh transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="text-xs tabular-nums text-kapur-dim">{Math.round(progress * 100)}%</p>
        </div>
      </div>
    </section>
  );
}
