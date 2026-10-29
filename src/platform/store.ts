/**
 * StoreAdapter — the seam between the clean public web build and the
 * App Store build. The web build is a strict no-op: no ads, no tracking,
 * no keys, nothing (App Store privacy posture: "Data Not Collected").
 *
 * The Capacitor iOS build (private dev environment) injects a real adapter:
 *   - IAP via StoreKit (Remove Ads, Theme bundles)
 *   - Rewarded/interstitial ad SDKs behind explicit user settings
 * Keys for that adapter live ONLY in the private .env — never in this repo,
 * never in the deployed docs/ bundle.
 */

export interface StoreAdapter {
  readonly isStoreBuild: boolean;
  /** True when "Remove Ads" has been purchased. */
  readonly adsRemoved: boolean;
  /** Initialize SDKs (store build only). Must be safe to call on web. */
  init(): Promise<void>;
  /** Buy a product id; resolves on success. No-op resolve(false) on web. */
  purchase(productId: string): Promise<boolean>;
  /** Show a rewarded video if available; resolves with reward granted. */
  showRewarded(): Promise<boolean>;
}

export const webStore: StoreAdapter = {
  isStoreBuild: false,
  adsRemoved: true,
  async init(): Promise<void> {
    /* intentionally empty — the public build is monetization-free */
  },
  async purchase(): Promise<boolean> {
    return false;
  },
  async showRewarded(): Promise<boolean> {
    return false;
  },
};
