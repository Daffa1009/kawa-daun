// Mengubah nama frame hasil ekstrak ezgif (ezgif-frame-001.jpg, ...) menjadi
// frame_000.jpg, frame_001.jpg, ... di public/frames, lalu mencetak jumlah total.
//
// Pakai:  node scripts/rename-frames.mjs <folder-sumber>
import { readdirSync, copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = process.argv[2];
if (!src) {
  console.error("Pakai: node scripts/rename-frames.mjs <folder-sumber>");
  process.exit(1);
}

const dest = join(process.cwd(), "public", "frames");
mkdirSync(dest, { recursive: true });

const files = readdirSync(src)
  .filter((f) => /\.(jpe?g)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

files.forEach((f, i) => {
  const name = `frame_${String(i).padStart(3, "0")}.jpg`;
  copyFileSync(join(src, f), join(dest, name));
});

console.log(`${files.length} frame disalin ke public/frames.`);
console.log(`Set FRAME_COUNT = ${files.length} di src/lib/constants.ts`);
