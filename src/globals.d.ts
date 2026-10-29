/**
 * Build-time constants injected by esbuild `define`.
 * Single source of truth for the version string is package.json —
 * see tools/check-version.mjs which asserts they stay in sync.
 */
declare const __VERSION__: string;
declare const __BUILD_DATE__: string;
