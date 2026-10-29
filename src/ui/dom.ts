/** Tiny DOM helpers — no framework, no virtual DOM, just clean nodes. */

export function el(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const node = template.content.firstElementChild;
  if (!node) throw new Error('el(): template produced no element');
  return node as HTMLElement;
}

export function qs<T extends HTMLElement>(root: HTMLElement, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`qs(): "${selector}" not found`);
  return found;
}

/** Escape a string for safe interpolation into HTML templates. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

/** Re-trigger a CSS animation class. */
export function retrigger(node: HTMLElement, cls: string): void {
  node.classList.remove(cls);
  void node.offsetWidth; /* force reflow */
  node.classList.add(cls);
}
