/**
 * Haptics — Vibration API wrapper. Android WebView vibrates; iOS WebView
 * does not (the Capacitor store build swaps in a native haptics adapter,
 * see platform/store.ts).
 */
export class Haptics {
  constructor(private enabled: boolean) {}

  setEnabled(v: boolean): void {
    this.enabled = v;
  }

  private fire(pattern: number | number[]): void {
    if (!this.enabled) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* unsupported — silent */
    }
  }

  /** Placement landed. */
  place(): void {
    this.fire(8);
  }

  /** Perfect drop. */
  perfect(): void {
    this.fire(12);
  }

  /** Milestone celebration. */
  milestone(): void {
    this.fire([10, 40, 14]);
  }

  /** The tower fell. */
  miss(): void {
    this.fire(24);
  }

  /** Light UI feedback. */
  ui(): void {
    this.fire(6);
  }
}
