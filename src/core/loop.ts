/**
 * Game clock: requestAnimationFrame loop with clamped delta, time-scale
 * (slow-motion on game over) and pause (manual + auto on tab hide).
 * Decoupled fixed-ish stepping keeps gameplay deterministic per frame-time.
 */
export class GameClock {
  /** Manual pause (user opened pause menu). */
  paused = false;
  /** Global time scale — 0.35 during the game-over slow motion. */
  timeScale = 1;
  /** Scaled elapsed seconds since boot (pauses excluded). */
  elapsed = 0;

  private last = performance.now();
  private raf = 0;
  private autoPaused = false;
  private running = false;

  constructor(private tick: (dt: number, elapsed: number) => void) {
    document.addEventListener('visibilitychange', () => {
      this.autoPaused = document.hidden;
      this.resetLast();
    });
  }

  private resetLast(): void {
    this.last = performance.now();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.resetLast();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (!(dt > 0)) return;
    if (dt > 0.1) dt = 0.1; // tab-switch spike clamp
    if (this.paused || this.autoPaused) return;
    const sdt = dt * this.timeScale;
    this.elapsed += sdt;
    this.tick(sdt, this.elapsed);
  };
}
