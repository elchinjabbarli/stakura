# fastlane

App Store release lanes for the Stakura iOS build (Capacitor: `ios/App/App.xcworkspace`, scheme `App`).

- What is here: `Fastfile` with `testflight`, `release` and `screenshots` lanes; App Store metadata is expected in `fastlane/metadata` (created locally with `fastlane deliver init`).
- Prerequisites: macOS with Xcode 15+, Ruby 3.x (bundler optional), a locally generated native `ios/` project (see capacitor.config.ts) and an App Store Connect API key with the Developer role.
- Commands: `fastlane testflight` (gym + pilot), `fastlane release` (gym + deliver), `fastlane screenshots` (placeholder; use Maestro).
- Security: ASC keys, signing certificates and .env files live only in your private environment and are never committed. Nothing under `docs/` (the public web build) ever contains keys.
- Versioning: package.json is the single source of truth; run `bun run check:version` before uploading.
