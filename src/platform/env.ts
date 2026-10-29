/** Environment detection helpers. */

export const env = {
  get isPages(): boolean {
    return typeof location !== 'undefined' && location.hostname.endsWith('.github.io');
  },
  get isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
  },
  get isTouch(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  },
  get prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};
