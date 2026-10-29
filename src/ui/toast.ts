/** Toast — lightweight bottom notifications, queued, aria-live. */
import { el, qs } from './dom';

export class Toast {
  readonly root: HTMLElement;
  private label: HTMLElement;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private queue: string[] = [];
  private showing = false;

  constructor(parent: HTMLElement) {
    this.root = el(`
      <div class="toast" role="status" aria-live="polite">
        <div class="toast-label"></div>
      </div>
    `);
    this.label = qs(this.root, '.toast-label');
    parent.appendChild(this.root);
  }

  show(message: string): void {
    this.queue.push(message);
    if (this.showing) return;
    this.next();
  }

  private next(): void {
    const msg = this.queue.shift();
    if (!msg) {
      this.showing = false;
      this.root.classList.remove('show');
      return;
    }
    this.showing = true;
    this.label.textContent = msg;
    this.root.classList.add('show');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.next(), 2100);
  }
}
