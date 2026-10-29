/**
 * Namespaced, versioned localStorage wrapper with an in-memory fallback
 * (private-browsing safe). Never throws.
 */
export class Storage {
  private mem = new Map<string, string>();
  private usable: boolean;

  constructor(private ns: string) {
    this.usable = (() => {
      try {
        const k = `${this.ns}.probe`;
        window.localStorage.setItem(k, '1');
        window.localStorage.removeItem(k);
        return true;
      } catch {
        return false;
      }
    })();
  }

  private full(key: string): string {
    return `${this.ns}.${key}`;
  }

  load<T>(key: string, fallback: T): T {
    try {
      const raw = this.usable ? window.localStorage.getItem(this.full(key)) : this.mem.get(key);
      if (!raw) return fallback;
      return { ...(fallback as object), ...(JSON.parse(raw) as object) } as T;
    } catch {
      return fallback;
    }
  }

  save(key: string, value: unknown): void {
    try {
      const raw = JSON.stringify(value);
      if (this.usable) window.localStorage.setItem(this.full(key), raw);
      else this.mem.set(key, raw);
    } catch {
      /* storage full or unavailable — ignore */
    }
  }

  remove(key: string): void {
    try {
      if (this.usable) window.localStorage.removeItem(this.full(key));
      else this.mem.delete(key);
    } catch {
      /* ignore */
    }
  }

  clearAll(): void {
    try {
      if (this.usable) {
        const prefix = `${this.ns}.`;
        const doomed: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(prefix)) doomed.push(k);
        }
        doomed.forEach((k) => window.localStorage.removeItem(k));
      }
      this.mem.clear();
    } catch {
      /* ignore */
    }
  }
}
