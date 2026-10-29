/**
 * Typed event bus — architecture borrowed from Godot's signal system
 * (godotengine/godot): game logic emits, UI/render subscribe.
 * Keeps src/game free of render imports (testable like bitwes/Gut does for Godot).
 */
export class EventBus<EventMap extends Record<string, unknown>> {
  private handlers = new Map<keyof EventMap, Set<(payload: never) => void>>();

  on<K extends keyof EventMap>(key: K, fn: (payload: EventMap[K]) => void): () => void {
    let set = this.handlers.get(key);
    if (!set) {
      set = new Set();
      this.handlers.set(key, set);
    }
    set.add(fn as (payload: never) => void);
    return () => this.off(key, fn);
  }

  off<K extends keyof EventMap>(key: K, fn: (payload: EventMap[K]) => void): void {
    this.handlers.get(key)?.delete(fn as (payload: never) => void);
  }

  emit<K extends keyof EventMap>(key: K, payload: EventMap[K]): void {
    const set = this.handlers.get(key);
    if (!set) return;
    for (const fn of [...set]) {
      try {
        (fn as (p: EventMap[K]) => void)(payload);
      } catch (err) {
        console.error(`[events] handler for "${String(key)}" failed`, err);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
