/**
 * Difficulty curves — pure functions, zero dependencies (Gut-style testability).
 * floor = number of placed blocks above the base (0 on the first drop).
 */
import { RULES, WORLD } from './constants';

/**
 * Sliding speed of the moving block in world units / second.
 * Fast asymptotic growth early, slow linear tail later. Soft-capped ~6.1.
 */
export function speedAt(floor: number): number {
  return 2.3 + 3.2 * (1 - Math.exp(-floor / 55)) + Math.min(floor * 0.004, 0.6);
}

/**
 * Perfect-drop tolerance in world units, scaled by how wide the current
 * block still is (narrow tower = tighter demands) and shrinking with height.
 * Generous at the start, demanding at 300m+.
 */
export function toleranceAt(floor: number, sizeRatio: number): number {
  const decay = Math.max(0.55, 1 - floor / 500);
  return Math.max(0.055, 0.16 * sizeRatio * decay);
}

/** Travel amplitude for the moving block (constant — the classic feel). */
export function amplitude(): number {
  return WORLD.AMPLITUDE;
}

/** Milestone floor check (constants-driven). Returns bonus gems or null. */
export function milestoneAt(floor: number): number | null {
  if (floor > 0 && floor % RULES.MILESTONE_EVERY === 0) return RULES.GEM_MILESTONE_BONUS;
  return null;
}
