/**
 * build.mjs — bundles the game into docs/ (the committed GitHub Pages site).
 *   JS:   src/main.ts  -> docs/assets/bundle.js   (esbuild, minified, iife)
 *   CSS:  styles/main.css -> docs/assets/style.css
 *   HTML: index.html (template) -> docs/index.html (version stamped)
 *   PWA:  manifest + service worker generated with the package version
 *   Icons: derived from art/icon-1024.png via tools/icons.mjs
 *
 * The version string comes from package.json and is stamped EVERYWHERE so
 * `bun run check:version` can prove they all match.
 */
import { build } from 'esbuild';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const VERSION = pkg.version;
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const SITE = 'https://elchinjabbarli.github.io/stakura/';

const docs = join(root, 'docs');
const assets = join(docs, 'assets');
const icons = join(docs, 'icons');

/* Targeted cleanup (docs/robots.txt is committed by hand — keep it). */
rmSync(assets, { recursive: true, force: true });
rmSync(icons, { recursive: true, force: true });
rmSync(join(docs, 'index.html'), { force: true });
rmSync(join(docs, 'manifest.webmanifest'), { force: true });
rmSync(join(docs, 'sw.js'), { force: true });
rmSync(join(docs, 'og.png'), { force: true });
mkdirSync(assets, { recursive: true });
mkdirSync(icons, { recursive: true });

/* ---------------- JS ---------------- */
await build({
  entryPoints: [join(root, 'src/main.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  outfile: join(assets, 'bundle.js'),
  define: {
    __VERSION__: JSON.stringify(VERSION),
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
});

/* ---------------- CSS ---------------- */
await build({
  entryPoints: [join(root, 'styles/main.css')],
  bundle: true,
  minify: true,
  outfile: join(assets, 'style.css'),
});

/* ---------------- HTML ---------------- */
const html = readFileSync(join(root, 'index.html'), 'utf8')
  .replaceAll('{{VERSION}}', VERSION)
  .replaceAll('{{BUILD_DATE}}', BUILD_DATE);
writeFileSync(join(docs, 'index.html'), html);

/* ---------------- PWA manifest ---------------- */
const manifest = {
  name: 'Stakura',
  short_name: 'Stakura',
  description: 'A serene 3D tower-stacking arcade. One tap, infinite towers.',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#1c1216',
  theme_color: '#1c1216',
  version: VERSION,
  icons: [
    { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: './icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
writeFileSync(join(docs, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

/* ---------------- Icons (before the SW so the asset list sees them) ---------------- */
if (existsSync(join(root, 'art/icon-1024.png'))) {
  execFileSync(process.execPath, [join(root, 'tools/icons.mjs')], { stdio: 'inherit' });
} else {
  console.warn('[build] art/icon-1024.png missing — skipping icons. Run: bun run icons');
}

/* ---------------- Service worker ---------------- */
/* Only precache assets that actually exist (partial builds must not break install). */
const swAssets = [
  './',
  './index.html',
  './assets/bundle.js',
  './assets/style.css',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './og.png',
].filter((p) => p === './' || existsSync(join(docs, p.slice(2))));

const sw = `/* Stakura service worker — generated at build time. Version ${VERSION}. */
const VERSION = '${VERSION}';
const CACHE = 'stakura-v' + VERSION;
const ASSETS = ${JSON.stringify(swAssets, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && (req.destination === '' || req.destination === 'document')) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
`;
writeFileSync(join(docs, 'sw.js'), sw);

/* ---------------- Report ---------------- */
console.log(`\n[build] Stakura v${VERSION} -> docs/`);
console.log(`[build] Site URL: ${SITE}`);
