/**
 * check-version.mjs — proves the version string is identical EVERYWHERE.
 * Source of truth: package.json. Checked files:
 *   - docs/manifest.webmanifest      (build-injected)
 *   - docs/sw.js                     (build-injected cache name)
 *   - docs/index.html                (build-stamped comment)
 *   - capacitor.config.ts            (iOS build notes)
 *   - fastlane/Fastfile              (App Store submission notes)
 *   - CHANGELOG.md                   (release entry)
 * Exit code 1 on any mismatch so CI can gate on it.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;

const checks = [
  {
    file: 'docs/manifest.webmanifest',
    extract: (s) => JSON.parse(s).version,
  },
  {
    file: 'docs/sw.js',
    extract: (s) => s.match(/const VERSION = '([^']+)'/)?.[1],
  },
  {
    file: 'docs/index.html',
    extract: (s) => s.match(/Stakura (\d+\.\d+\.\d+) —/)?.[1],
  },
  {
    file: 'capacitor.config.ts',
    extract: (s) => s.match(/must equal (\d+\.\d+\.\d+)/)?.[1],
  },
  {
    file: 'fastlane/Fastfile',
    extract: (s) => s.match(/must equal (\d+\.\d+\.\d+)/)?.[1],
  },
  {
    file: 'CHANGELOG.md',
    extract: (s) => s.match(/\[(\d+\.\d+\.\d+)\]/)?.[1],
  },
];

let ok = true;
console.log(`\n[check:version] package.json = ${version}\n`);

for (const check of checks) {
  const path = join(root, check.file);
  if (!existsSync(path)) {
    console.log(`  SKIP (missing)  ${check.file}`);
    continue;
  }
  const found = check.extract(readFileSync(path, 'utf8'));
  const match = found === version;
  if (!match) ok = false;
  console.log(`  ${match ? 'OK  ' : 'FAIL'}  ${check.file.padEnd(28)} ${found ?? '(not found)'}`);
}

console.log(ok ? '\n[check:version] all versions in sync.\n' : '\n[check:version] MISMATCH — fix the files above!\n');
process.exit(ok ? 0 : 1);
