/**
 * icons.mjs — derives every icon size + the OG banner from art/icon-1024.png
 * using sharp. The 1024 source is generated original art (see art/README).
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'art/icon-1024.png');
const iconsDir = join(root, 'docs/icons');
mkdirSync(iconsDir, { recursive: true });

if (!existsSync(src)) {
  console.error('[icons] art/icon-1024.png not found');
  process.exit(1);
}

const pipeline = sharp(src).png({ quality: 95, compressionLevel: 9 });

await pipeline.clone().resize(192, 192).toFile(join(iconsDir, 'icon-192.png'));
await pipeline.clone().resize(512, 512).toFile(join(iconsDir, 'icon-512.png'));
await pipeline.clone().resize(512, 512).toFile(join(iconsDir, 'maskable-512.png'));
await pipeline.clone().resize(180, 180).toFile(join(iconsDir, 'apple-touch-icon.png'));
await pipeline.clone().resize(32, 32).toFile(join(iconsDir, 'favicon-32.png'));

/* OG banner 1200x630 — dusk gradient + icon + wordmark. */
const icon512 = await sharp(src).resize(430, 430).png().toBuffer();
const ogSvg = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2b1030"/>
      <stop offset="0.55" stop-color="#93415f"/>
      <stop offset="1" stop-color="#eda05f"/>
    </linearGradient>
    <linearGradient id="word" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f2a25c"/>
      <stop offset="1" stop-color="#ef92ac"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="600" cy="640" rx="700" ry="260" fill="#1c1216" opacity="0.35"/>
  <image x="105" y="100" width="430" height="430" href="data:image/png;base64,${icon512.toString('base64')}"/>
  <text x="970" y="300" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        font-size="96" font-weight="800" letter-spacing="14" fill="url(#word)">STAKURA</text>
  <text x="970" y="368" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        font-size="30" font-weight="600" letter-spacing="6" fill="#f7ece7" opacity="0.75">SERENE TOWER STACKING</text>
</svg>`);
await sharp(ogSvg).png({ quality: 92 }).toFile(join(root, 'docs/og.png'));

console.log('[icons] wrote icon-192, icon-512, maskable-512, apple-touch-icon, favicon-32, og.png');
