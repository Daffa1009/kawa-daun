"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { STORY } from "@/data/story";
import { Ukiran } from "@/components/ui/Ukiran";
import { cn } from "@/lib/utils";

type SpiceProps = {
  src: string;
  alt: string;
  progress: MotionValue<number>;
  /** Jarak geser vertikal (px) dari awal ke akhir scroll. Negatif = naik lebih cepat. */
  travel: [number, number];
  rotate?: [number, number];
  size: number;
  className?: string;
  /** Delay animasi melayang agar tiap rempah tidak bergerak serempak */
  floatDelay?: number;
};

/** Satu elemen rempah yang bergerak parallax + melayang pelan. */
function Spice({
  src,
  alt,
  progress,
  travel,
  rotate = [0, 0],
  size,
  className,
  floatDelay = 0,
}: SpiceProps) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : travel);
  const r = useTransform(progress, [0, 1], reduce ? [0, 0] : rotate);

  return (
    <motion.div
      style={{ y, rotate: r, width: size }}
      className={cn("pointer-events-none absolute z-0", className)}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={{
          duration: 6,
          delay: floatDelay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* mix-blend-screen membuat latar gelap gambar "hilang" di atas background */}
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          sizes={`${size}px`}
          className="h-auto w-full mix-blend-screen"
        />
      </motion.div>
    </motion.div>
  );
}

export default function StorySection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // progress 0 saat section mulai masuk layar, 1 saat section keluar
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Gambar tempurung: bingkai naik pelan, isi gambar bergerak berlawanan
  const frameY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [140, -140]);
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-9%", "9%"]);

  return (
    <section
      ref={ref}
      id="cerita"
      className="relative overflow-hidden bg-gradient-to-b from-sayak via-sayak-800 to-sayak py-28 md:py-44"
    >
      <Ukiran className="absolute inset-x-0 top-0 opacity-40" />

      {/* ---- Rempah melayang (parallax berlapis: kecepatan beda = kesan kedalaman) ---- */}
      <Spice src="/images/jahe-iris.png" alt="Irisan jahe" progress={scrollYProgress}
        travel={[220, -320]} rotate={[-12, 14]} size={260}
        className="-left-10 top-[6%] sm:left-[3%]" />
      <Spice src="/images/bunga-lawang.png" alt="Bunga lawang" progress={scrollYProgress}
        travel={[120, -200]} rotate={[0, 60]} size={150}
        className="right-[4%] top-[14%]" floatDelay={1.2} />
      <Spice src="/images/kayu-manis.png" alt="Kayu manis" progress={scrollYProgress}
        travel={[280, -420]} rotate={[8, -16]} size={290}
        className="-right-16 top-[40%] sm:right-[1%]" floatDelay={0.6} />
      <Spice src="/images/gula-aren.png" alt="Gula aren" progress={scrollYProgress}
        travel={[160, -260]} rotate={[-6, 10]} size={200}
        className="-left-8 top-[56%] sm:left-[5%]" floatDelay={2} />
      <Spice src="/images/cengkeh.png" alt="Cengkeh" progress={scrollYProgress}
        travel={[60, -140]} rotate={[0, -40]} size={240}
        className="left-[18%] top-[30%] hidden sm:block" floatDelay={0.3} />
      <Spice src="/images/jahe.png" alt="Rimpang jahe" progress={scrollYProgress}
        travel={[200, -300]} rotate={[10, -8]} size={240}
        className="-right-10 top-[78%] sm:right-[6%]" floatDelay={1.8} />
      <Spice src="/images/bunga-lawang-2.png" alt="Bunga lawang" progress={scrollYProgress}
        travel={[80, -180]} rotate={[0, -50]} size={130}
        className="left-[8%] top-[88%] hidden md:block" floatDelay={0.9} />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Judul + pembuka */}
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.08] text-kapur sm:text-5xl md:text-6xl">
            {STORY.heading}
          </h2>
          <p className="mt-8 max-w-xl font-display text-lg leading-relaxed text-kapur-dim md:text-xl">
            {STORY.intro}
          </p>
        </div>

        {/* Bab 1 — kiri */}
        <Chapter {...STORY.chapters[0]} className="mt-24 md:mt-36 md:max-w-md" />

        {/* Tempurung — pusat cerita, parallax di dalam bingkai */}
        <motion.figure
          style={{ y: frameY }}
          className="mx-auto my-24 w-64 sm:w-80 md:my-40 md:w-[24rem]"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl border border-seduh/30 shadow-[0_30px_80px_-20px_rgba(200,120,42,0.35)]">
            <motion.div style={{ y: imageY }} className="absolute inset-x-0 -inset-y-[12%]">
              <Image
                src="/images/tempurung.jpeg"
                alt="Kawa daun hangat dalam sayak tempurung kelapa"
                fill
                sizes="(min-width: 768px) 384px, 320px"
                className="object-cover"
              />
            </motion.div>
          </div>
          <figcaption className="mt-4 text-center text-sm text-kapur-dim">
            Sayak: tempurung kelapa yang menjaga seduhan tetap hangat.
          </figcaption>
        </motion.figure>

        {/* Bab 2 — kanan */}
        <Chapter {...STORY.chapters[1]} className="md:ml-auto md:max-w-md" />

        {/* Bab 3 — tengah-kiri */}
        <Chapter {...STORY.chapters[2]} className="mt-20 md:mt-32 md:ml-[12%] md:max-w-lg" />
      </div>
    </section>
  );
}

function Chapter({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={cn("border-l border-seduh/40 pl-6", className)}
    >
      <h3 className="font-display text-2xl text-seduh-light md:text-3xl">{title}</h3>
      <p className="mt-3 leading-relaxed text-kapur/85">{body}</p>
    </motion.div>
  );
}
