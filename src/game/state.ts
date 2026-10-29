/**
 * Game — the orchestrator. Owns the tower model, run stats, economy and
 * state machine. Emits events; never touches rendering or DOM directly.
 * (Godot-style separation: logic emits signals, scene/ui listen.)
 */
import { TowerModel } from './stack';
import { milestoneAt } from './difficulty';
import { mulberry32 } from '../core/rng';
import { EventBus } from '../core/events';
import { RULES, STORAGE_KEY } from './constants';
import { DEFAULT_THEME_ID, STORM_UNLOCK_HEIGHT, THEMES, themeById } from './themes';
import type { Missions } from './missions';
import type { Storage } from '../core/storage';
import type { GameEvents, GameState, RunStats, SaveData } from './types';

export function defaultSave(): SaveData {
  return {
    v: 1,
    best: 0,
    gems: 0,
    unlocked: [DEFAULT_THEME_ID],
    theme: DEFAULT_THEME_ID,
    stats: { runs: 0, totalFloors: 0, totalPerfects: 0, bestCombo: 0, playMs: 0 },
    settings: { sound: true, haptics: true, quality: 'auto', lang: 'en' },
    missions: { date: '', list: [], progress: {}, claimed: [] },
    onboarded: false,
  };
}

/** Normalize older/foreign save shapes in place (forward-compatible). */
export function migrateSave(save: SaveData): void {
  const fresh = defaultSave();
  /* Per-field merges so partially-stored older saves never produce holes. */
  save.stats = { ...fresh.stats, ...save.stats };
  save.settings = { ...fresh.settings, ...save.settings };
  if (!Array.isArray(save.unlocked) || save.unlocked.length === 0) save.unlocked = [DEFAULT_THEME_ID];
  if (!save.missions || !Array.isArray(save.missions.list)) {
    save.missions = { date: '', list: [], progress: {}, claimed: [] };
  }
  if (!save.missions.progress) save.missions.progress = {};
  if (!Array.isArray(save.missions.claimed)) save.missions.claimed = [];
}

export class Game {
  readonly bus = new EventBus<GameEvents>();
  readonly tower: TowerModel;
  readonly save: SaveData;
  /** Injected right after construction (needs bus + save). */
  missions!: Missions;

  state: GameState = 'menu';
  run: RunStats | null = null;

  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private runStartWall = 0;

  constructor(private storage: Storage) {
    this.save = storage.load<SaveData>(STORAGE_KEY, defaultSave());
    migrateSave(this.save);
    this.tower = new TowerModel(mulberry32((Date.now() & 0xffffffff) >>> 0));
    this.tower.reset();
  }

  /* ---------------------------------------------------------------- */
  /* Persistence                                                       */
  /* ---------------------------------------------------------------- */

  persist(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      this.storage.save(STORAGE_KEY, this.save);
      this.persistTimer = null;
    }, 250);
  }

  persistNow(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.storage.save(STORAGE_KEY, this.save);
  }

  /* ---------------------------------------------------------------- */
  /* Run lifecycle                                                     */
  /* ---------------------------------------------------------------- */

  private setState(to: GameState): void {
    const from = this.state;
    if (from === to) return;
    this.state = to;
    this.bus.emit('state:change', { from, to });
  }

  startRun(): void {
    if (this.state === 'playing') return;
    this.missions.ensureDaily();
    this.tower.reset();
    this.tower.spawnNext();
    this.run = { height: 0, perfects: 0, bestCombo: 0, gems: 0, startedAt: Date.now() };
    this.runStartWall = performance.now();
    this.missions.track('runs', 1, 'add');
    this.setState('playing');
    this.bus.emit('run:start', {});
  }

  /** The one input of the game: drop the moving block. */
  drop(): void {
    if (this.state !== 'playing' || !this.tower.active) return;
    const result = this.tower.drop();
    const run = this.run;
    if (!run) return;

    if (result.type === 'miss') {
      this.bus.emit('block:miss', { piece: result.fallen });
      this.endRun();
      return;
    }

    const floor = result.block.index;
    run.height = floor;
    this.missions.track('floors', 1, 'add');

    if (result.type === 'perfect') {
      run.perfects += 1;
      run.bestCombo = Math.max(run.bestCombo, result.combo);
      this.missions.track('perfects', 1, 'add');
      this.missions.track('combo', result.combo, 'max');
      this.gainGems(RULES.GEM_PER_PERFECT + (result.combo >= RULES.GEM_COMBO_BONUS_AT ? RULES.GEM_COMBO_BONUS : 0));
    } else {
      this.bus.emit('block:cut', { piece: result.cut });
    }

    this.bus.emit('block:place', {
      block: result.block,
      perfect: result.type === 'perfect',
      combo: result.type === 'perfect' ? result.combo : 0,
      regrow: result.type === 'perfect' && result.regrow,
    });

    const bonus = milestoneAt(floor);
    if (bonus !== null) {
      this.gainGems(bonus);
      this.bus.emit('milestone', { height: floor, bonus });
    }

    this.tower.spawnNext();
  }

  private endRun(): void {
    const run = this.run;
    if (!run) return;
    const isRecord = run.height > this.save.best;
    if (isRecord) this.save.best = run.height;

    this.save.stats.runs += 1;
    this.save.stats.totalFloors += run.height;
    this.save.stats.totalPerfects += run.perfects;
    this.save.stats.bestCombo = Math.max(this.save.stats.bestCombo, run.bestCombo);
    this.save.stats.playMs += Math.round(performance.now() - this.runStartWall);

    this.missions.track('height', run.height, 'max');

    /* Achievement theme unlock. */
    if (run.height >= STORM_UNLOCK_HEIGHT && !this.save.unlocked.includes('storm')) {
      this.save.unlocked.push('storm');
      this.bus.emit('theme:unlock', { id: 'storm' });
    }

    this.persistNow();
    this.setState('gameover');
    this.bus.emit('run:end', {
      height: run.height,
      best: this.save.best,
      isRecord,
      gems: run.gems,
    });
  }

  private gainGems(amount: number): void {
    if (amount <= 0) return;
    this.save.gems += amount;
    if (this.run) this.run.gems += amount;
    this.persist();
    this.bus.emit('gems:gain', { amount, total: this.save.gems });
  }

  /* ---------------------------------------------------------------- */
  /* Meta: themes                                                      */
  /* ---------------------------------------------------------------- */

  canAfford(themeId: string): boolean {
    const theme = themeById(themeId);
    return this.save.gems >= theme.cost;
  }

  buyTheme(themeId: string): boolean {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme || theme.cost < 0) return false;
    if (this.save.unlocked.includes(themeId)) return false;
    if (this.save.gems < theme.cost) return false;
    this.save.gems -= theme.cost;
    this.save.unlocked.push(themeId);
    this.selectTheme(themeId);
    this.bus.emit('theme:unlock', { id: themeId });
    this.persistNow();
    return true;
  }

  selectTheme(themeId: string): boolean {
    if (!this.save.unlocked.includes(themeId)) return false;
    if (this.save.theme === themeId) return true;
    this.save.theme = themeId;
    this.persist();
    this.bus.emit('theme:select', { id: themeId });
    return true;
  }

  /* ---------------------------------------------------------------- */
  /* Flow control                                                      */
  /* ---------------------------------------------------------------- */

  pause(): void {
    if (this.state !== 'playing') return;
    this.setState('paused');
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.setState('playing');
  }

  restart(): void {
    this.startRun();
  }

  toMenu(): void {
    this.tower.reset();
    this.run = null;
    this.setState('menu');
  }

  /* ---------------------------------------------------------------- */
  /* Frame update                                                      */
  /* ---------------------------------------------------------------- */

  update(dt: number): void {
    if (this.state === 'playing') {
      this.tower.update(dt);
    }
  }

  setSetting<K extends keyof SaveData['settings']>(key: K, value: SaveData['settings'][K]): void {
    this.save.settings[key] = value;
    this.persist();
    this.bus.emit('settings:change', { key });
  }

  completeOnboarding(): void {
    this.save.onboarded = true;
    this.persist();
  }

  resetProgress(): void {
    this.storage.clearAll();
    const fresh = defaultSave();
    Object.assign(this.save, fresh, { settings: { ...fresh.settings } });
    this.missions.ensureDaily();
    this.persistNow();
    this.bus.emit('theme:select', { id: DEFAULT_THEME_ID });
  }
}
