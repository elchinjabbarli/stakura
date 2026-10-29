/**
 * Input — the game has exactly one verb: DROP.
 * Pointer (tap/click) + keyboard (Space / Enter). Multi-touch safe,
 * double-fire debounced, ignores taps that originate inside UI chrome.
 */

export class Input {
  private lastFire = 0;

  constructor(private onDrop: () => void) {
    window.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        const target = e.target;
        if (target instanceof Element && target.closest('.ui-block')) return;
        this.fire();
      },
      { passive: true },
    );
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.repeat) return;
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
          const target = e.target;
          if (target instanceof Element && target.closest('.ui-block')) return;
          e.preventDefault();
          this.fire();
        }
      },
      { passive: false },
    );
    /* Block iOS pinch-zoom & double-tap zoom inside the game. */
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 1) e.preventDefault();
      },
      { passive: false },
    );
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private fire(): void {
    const now = performance.now();
    if (now - this.lastFire < 70) return;
    this.lastFire = now;
    this.onDrop();
  }
}
