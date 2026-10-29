/**
 * dev.mjs — watch mode: rebuild into docs/ AND copy into the Next.js public
 * folder (../public/game) so the sandbox preview at / always serves the
 * freshest build. Run: bun run dev
 */
import { context } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await import('node:fs').then((fs) => JSON.parse(fs.readFileSync(join(root, 'package.json'), 'utf8'))));
const VERSION = pkg.version;
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const target = join(root, '../public/game');

async function rebuild() {
  execFileSync(process.execPath, [join(root, 'build.mjs')], { stdio: 'inherit' });
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
  mkdirSync(join(target, '..'), { recursive: true });
  cpSync(join(root, 'docs'), target, { recursive: true });
  console.log('[dev] copied docs/ -> ../public/game');
}

await rebuild();

const js = await context({
  entryPoints: [join(root, 'src/main.ts')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  outfile: join(root, 'docs/assets/bundle.js'),
  define: {
    __VERSION__: JSON.stringify(VERSION),
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
});

const css = await context({
  entryPoints: [join(root, 'styles/main.css')],
  bundle: true,
  minify: true,
  outfile: join(root, 'docs/assets/style.css'),
});

let timer = null;
const onChange = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void rebuild();
  }, 120);
};

await js.watch({ onRebuild: onChange });
await css.watch({ onRebuild: onChange });
console.log('[dev] watching src/ and styles/ ...');
