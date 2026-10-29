/**
 * Capacitor configuration for the Stakura iOS App Store build.
 *
 * The committed `docs/` folder is the web build served by GitHub Pages and is
 * used here as the web directory, so the store build ships the exact same
 * bundle that runs at https://elchinjabbarli.github.io/stakura/.
 *
 * HOW TO BUILD THE iOS APP FROM A MAC (exact steps):
 *   1. npm i -D @capacitor/core @capacitor/cli @capacitor/ios
 *   2. npx cap add ios
 *   3. npx cap sync
 *   4. open ios/App/App.xcworkspace in Xcode
 *   5. set signing team (Signing & Capabilities -> Team)
 *   6. npx cap run ios
 *
 * VERSIONING:
 *   The single source of truth for the version is package.json; keep every
 *   copy in sync by running `bun run check:version`. The app version set in
 *   App Store Connect at submission must equal 1.0.0 (Capacitor reads the
 *   display version from the Xcode project or package.json), so bump the
 *   version everywhere before uploading a new build.
 *
 * The native `ios/` folder is generated locally and is gitignored; it is
 * never committed to this repository.
 */

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elchinjabbarli.stakura',
  appName: 'Stakura',
  webDir: 'docs',
  backgroundColor: '#1c1216',
  ios: {
    scrollEnabled: false,
    limitsNavigationsToAppDomain: true,
  },
};

export default config;
