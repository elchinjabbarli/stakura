/**
 * Daily missions — seeded by the calendar date, identical for every player
 * that day (dailySeed). Hybrid-casual retention layer; no server needed.
 */
import { dailySeed, mulberry32, pick, randInt } from '../core/rng';
import type { EventBus } from '../core/events';
import type { MissionDef, MissionType, MissionView, SaveData } from './types';
import type { GameEvents } from './types';

interface MissionTemplate {
  type: MissionType;
  titleKey: string;
  targets: [number, number, number]; // tiers: easy, mid, hard
  rewards: [number, number, number];
}

const TEMPLATES: readonly MissionTemplate[] = [
  { type: 'height', titleKey: 'mission.height', targets: [25, 50, 90], rewards: [15, 25, 40] },
  { type: 'perfects', titleKey: 'mission.perfects', targets: [10, 20, 35], rewards: [15, 25, 40] },
  { type: 'combo', titleKey: 'mission.combo', targets: [4, 6, 9], rewards: [20, 30, 45] },
  { type: 'runs', titleKey: 'mission.runs', targets: [3, 5, 8], rewards: [10, 15, 25] },
  { type: 'floors', titleKey: 'mission.floors', targets: [80, 150, 260], rewards: [20, 35, 50] },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export class Missions {
  private list: MissionDef[] = [];

  constructor(
    private save: SaveData,
    private bus: EventBus<GameEvents>,
    private persist: () => void,
  ) {
    this.ensureDaily();
  }

  /** Regenerate when the date rolls over; restore from save otherwise. */
  ensureDaily(): void {
    const key = todayKey();
    if (this.save.missions.date === key && this.save.missions.list.length === 3) {
      this.list = this.save.missions.list;
      return;
    }
    const rng = mulberry32(dailySeed());
    const pool = [...TEMPLATES];
    const picked: MissionTemplate[] = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const tpl = pick(rng, pool);
      pool.splice(pool.indexOf(tpl), 1);
      picked.push(tpl);
    }
    // Mission difficulty follows the player's best height a little.
    const tierBias = this.save.best >= 100 ? 2 : this.save.best >= 40 ? 1 : 0;
    this.list = picked.map((tpl, i) => {
      const tier = Math.min(2, Math.max(0, tierBias === 0 ? randInt(rng, 0, 1) : tierBias - (i % 2)));
      return {
        id: `${key}:${tpl.type}`,
        type: tpl.type,
        target: tpl.targets[tier],
        reward: tpl.rewards[tier],
        titleKey: tpl.titleKey,
      };
    });
    this.save.missions = { date: key, list: this.list, progress: {}, claimed: [] };
    this.persist();
  }

  /**
   * Track mission progress.
   * mode 'add' accumulates; mode 'max' keeps the highest value seen.
   */
  track(type: MissionType, value: number, mode: 'add' | 'max'): void {
    let dirty = false;
    for (const m of this.list) {
      if (m.type !== type) continue;
      if (this.save.missions.claimed.includes(m.id)) continue;
      const prev = this.save.missions.progress[m.id] ?? 0;
      const next = mode === 'add' ? prev + value : Math.max(prev, value);
      if (next !== prev) {
        this.save.missions.progress[m.id] = Math.min(next, m.target);
        dirty = true;
        if (prev < m.target && next >= m.target) {
          this.bus.emit('mission:complete', { id: m.id, reward: m.reward });
        } else {
          this.bus.emit('mission:progress', { type });
        }
      }
    }
    if (dirty) this.persist();
  }

  /** Claim the reward for a completed mission. Returns gems gained (0 if not claimable). */
  claim(id: string): number {
    const m = this.list.find((x) => x.id === id);
    if (!m) return 0;
    const prog = this.save.missions.progress[id] ?? 0;
    if (prog < m.target || this.save.missions.claimed.includes(id)) return 0;
    this.save.missions.claimed.push(id);
    this.save.gems += m.reward;
    this.persist();
    return m.reward;
  }

  view(): MissionView[] {
    return this.list.map((m) => {
      const progress = Math.min(this.save.missions.progress[m.id] ?? 0, m.target);
      return {
        ...m,
        progress,
        done: progress >= m.target,
        claimed: this.save.missions.claimed.includes(m.id),
      };
    });
  }
}
