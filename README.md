# Stakura

A serene 3D tower-stacking arcade: one tap, an endless procedurally generated tower, and a warm sakura sky. Built with TypeScript and Three.js, shipped as a free, clean PWA.

Play: https://elchinjabbarli.github.io/stakura/

WebGL · TypeScript · Three.js · Zero dependencies at runtime beyond three.js

## Türkçe özet

- Stakura, tek dokunuşla oynanan, sonsuz prosedürel biyomları olan sakin bir 3D kule dizme oyunudur.
- TypeScript ve Three.js ile yazıldı; çalışma zamanında three.js dışında bağımlılığı yoktur.
- Web sürümü ücretsiz ve temizdir: reklam yok, izleme yok, PWA olarak tamamen çevrimdışı çalışır.
- iOS App Store yolculuğu Capacitor, fastlane ve Maestro araçlarıyla hazırlanmıştır.

## What is Stakura

- One-tap 3D stacking: a single input drops the sliding block; timing decides everything.
- Infinite procedurally generated difficulty and biomes, with a new biome every 12 floors — no manual levels.
- Perfect-combo system with block regrowth: flawless drops rebuild the tower slice and chain into higher multipliers.
- Hybrid-casual meta: gems, daily seeded missions, and 10 unlockable themes (EN/TR/AZ localization).
- Runs fully offline as a PWA with handcrafted CSS and procedural Web Audio sound.

## Why this genre

The stacking / one-tap arcade genre has generated hundreds of millions of downloads historically, while the mechanics themselves are not copyrightable. Stakura's expression — the name, art, code, and sound — is 100% original, and the genre's proven demand makes it a rational choice for a small, focused arcade.

## Quick start

```sh
bun install     # installs three.js + dev toolchain (esbuild, typescript, sharp)
bun run dev     # local dev server with hot rebuild
bun run build   # bundles TS + three.js into a single JS file, outputs to docs/
```

Additional scripts: `bun run typecheck` (strict TS, no emit), `bun run icons` (PWA icon generation), `bun run check:version` (version consistency).

## Project structure

```
stakura/
  src/core/            engine: loop, input, math, seeding, audio
  src/game/            stacking rules, combos, missions, economy
  src/render/          three.js scene, camera, materials, biome visuals
  src/ui/              DOM overlay: menu, HUD, themes, settings
  src/platform/        store adapter interfaces, PWA helpers
  styles/              handcrafted CSS (no framework)
  docs/                built site, committed and served by GitHub Pages
  tools/               build and icon scripts (node)
  fastlane/            App Store release lanes (TestFlight, deliver)
  maestro/             iOS smoke test flows
  capacitor.config.ts  iOS App Store build configuration
```

## Web deployment

GitHub Pages serves the `/docs` folder on the `main` branch; `bun run build` writes the bundle there. The service worker (`docs/sw.js`) activates only on the github.io host, so local development and other hosts stay unaffected. Bump the version in `package.json` (the single source of truth) and run `bun run check:version` to validate consistency across `package.json`, `src/game/constants.ts`, `docs/manifest.webmanifest`, `docs/sw.js`, and `capacitor.config.ts` before pushing.

## iOS App Store path

1. Install Capacitor iOS deps, run `npx cap add ios`, then `npx cap sync` (web build comes from `docs/`).
2. Open `ios/App/App.xcworkspace` in Xcode and set the signing team.
3. Run on device with `npx cap run ios` — full steps are documented in `capacitor.config.ts`.
4. Upload with `fastlane testflight` (gym + pilot) or `fastlane release` (gym + deliver).
5. Smoke test every build with `maestro test maestro/flows`.

Privacy posture: the web build collects nothing ("Data Not Collected" — no ads, no tracking). The store build injects monetization adapters from the private environment (`.env`, gitignored); real SDK keys never live in this repository.

## Versioning

The single source of truth is `package.json`. Validate all copies with `bun run check:version`. Current version: 1.0.0.

## Roadmap

| Window | Milestone |
| --- | --- |
| 2026 H1 | Web soft-launch on GitHub Pages + KPI telemetry via private infra |
| 2026 H2 | Capacitor TestFlight build + hybrid-casual monetization adapters |
| 2027 | App Store global release with IAP (Remove Ads / Theme bundles), live-ops events |

## License

Stakura (game, source, art, name) © 2026 Elchin Jabbarli. All rights reserved — see LICENSE.md. Third-party libraries remain under their own licenses — see THIRD_PARTY_NOTICES.md.
