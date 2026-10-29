# Changelog

All notable changes to Stakura will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026

Initial public web release.

### Added

- Core one-tap 3D stacking loop with perfect-combo system and block regrowth.
- Infinite procedurally generated difficulty and biomes, rotating every 12 floors.
- Hybrid-casual meta: gems, daily seeded missions, and 10 unlockable themes.
- Localization for daily missions in English, Turkish, and Azerbaijani.
- Procedural Web Audio sound and handcrafted CSS interface.
- PWA support: web app manifest plus a service worker that activates only on the GitHub Pages host; the game runs fully offline.
- Release tooling: esbuild single-file bundle output to `docs/`, version consistency check (`bun run check:version`), PWA icon generation, and the Capacitor + fastlane + Maestro iOS App Store pipeline.
