/**
 * All gameplay tuning in one place. Distances are world units, times seconds.
 * These constants are the "game feel" — change here, nowhere else.
 * (Discipline per obra/superpowers + karpathy-skills: surgical changes only.)
 */

/** Injected at build time (see globals.d.ts + build.mjs). */
export const VERSION: string = __VERSION__;
export const BUILD_DATE: string = __BUILD_DATE__;

export const WORLD = {
  /** Height of one block. */
  BLOCK_H: 0.5,
  /** Starting footprint of the tower (x and z). */
  BASE: 3.0,
  /** How far the moving block travels from center, each way. */
  AMPLITUDE: 3.4,
  /** Depth of the decorative base column under the first block. */
  BASE_COLUMN_DEPTH: 70,
} as const;

export const RULES = {
  /** Consecutive perfects needed before the block starts regrowing. */
  PERFECT_REGROW_MIN_STREAK: 2,
  /** Regrow amount per perfect, as ratio of BASE. */
  PERFECT_REGROW_RATIO: 0.25,
  /** Gems per perfect drop. */
  GEM_PER_PERFECT: 1,
  /** Extra gems when combo reaches this. */
  GEM_COMBO_BONUS_AT: 5,
  GEM_COMBO_BONUS: 2,
  /** Bonus gems at every milestone. */
  GEM_MILESTONE_BONUS: 5,
  /** Milestone banner every N floors. */
  MILESTONE_EVERY: 25,
} as const;

export const CAMERA = {
  FOV: 42,
  NEAR: 0.1,
  FAR: 220,
  PLAY_OFFSET_Y: 6.1,
  PLAY_OFFSET_Z: 9.4,
  PLAY_LOOK_ABOVE: 0.9,
  MENU_RADIUS: 11.5,
  MENU_HEIGHT: 4.4,
  MENU_LOOK_Y: 2.6,
  MENU_SPIN: 0.1,
  OVER_SPIN: 0.08,
  /** Critically-damped smoothing factor. */
  SMOOTH: 3.6,
} as const;

export const LIMITS = {
  MAX_INSTANCED_BLOCKS: 1200,
  DEBRIS_POOL: 14,
  SPARKS: 64,
  PETALS_MAX: 260,
} as const;

export const STORAGE_KEY = 'save.v1';
