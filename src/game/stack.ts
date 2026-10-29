/**
 * TowerModel — the stacking logic, 100% pure (no rendering, no DOM).
 * This is the file a unit test would cover first (bitwes/Gut discipline).
 *
 * Coordinate system: y up, tower centered at origin. Blocks alternate the
 * sliding axis (x, then z). The moving block ping-pongs with constant speed.
 */
import { amplitude, speedAt, toleranceAt } from './difficulty';
import { RULES, WORLD } from './constants';
import type { ActiveBlock, Axis, Block, CutPiece, DropResult } from './types';
import type { Rng } from '../core/rng';

/** Ping-pong position on [-amp, +amp] for phase u in [0,1). */
function pingpong(u: number, amp: number): number {
  return amp * (u < 0.5 ? 4 * u - 1 : 3 - 4 * u);
}

export class TowerModel {
  blocks: Block[] = [];
  active: ActiveBlock | null = null;
  /** Current consecutive-perfect combo (0 after any non-perfect drop). */
  combo = 0;

  constructor(private rng: Rng) {}

  get top(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  /** Height in floors above the base — the score. */
  get height(): number {
    return this.blocks.length - 1;
  }

  reset(): void {
    this.combo = 0;
    this.blocks = [
      { x: 0, z: 0, sx: WORLD.BASE, sz: WORLD.BASE, y: 0, index: 0 },
    ];
    this.active = null;
  }

  spawnNext(): ActiveBlock {
    const prev = this.top;
    const index = this.blocks.length;
    const axis: Axis = index % 2 === 1 ? 'x' : 'z';
    const amp = amplitude();
    const u = this.rng() < 0.5 ? 0 : 0.5;
    const active: ActiveBlock = {
      axis,
      u,
      /* Slide on one axis, stay aligned with the tower top on the other. */
      x: axis === 'x' ? pingpong(u, amp) : prev.x,
      z: axis === 'z' ? pingpong(u, amp) : prev.z,
      sx: prev.sx,
      sz: prev.sz,
      y: prev.y + WORLD.BLOCK_H,
    };
    this.active = active;
    return active;
  }

  update(dt: number): void {
    const a = this.active;
    if (!a) return;
    const amp = amplitude();
    const speed = speedAt(this.blocks.length - 1);
    a.u = (a.u + (dt * speed) / (2 * amp)) % 1;
    if (a.axis === 'x') a.x = pingpong(a.u, amp);
    else a.z = pingpong(a.u, amp);
  }

  /** Current tolerance for a perfect drop (exposed for tuning/debug). */
  tolerance(): number {
    const prev = this.top;
    const axis: Axis = this.blocks.length % 2 === 1 ? 'x' : 'z';
    const size = axis === 'x' ? prev.sx : prev.sz;
    return toleranceAt(this.blocks.length - 1, size / WORLD.BASE);
  }

  drop(): DropResult {
    const a = this.active;
    if (!a) throw new Error('drop() called with no active block');
    const prev = this.top;
    const axis = a.axis;

    const cur = axis === 'x' ? a.x : a.z;
    const prevC = axis === 'x' ? prev.x : prev.z;
    const prevS = axis === 'x' ? prev.sx : prev.sz;
    const delta = cur - prevC;
    const adelta = Math.abs(delta);
    this.active = null;

    /* Total miss — the whole block tumbles down. */
    if (adelta >= prevS) {
      this.combo = 0;
      return {
        type: 'miss',
        fallen: {
          x: a.x,
          z: a.z,
          sx: a.sx,
          sz: a.sz,
          y: a.y,
          axis,
          dir: (Math.sign(delta) || 1) as 1 | -1,
        },
      };
    }

    const index = this.blocks.length;
    const tol = toleranceAt(index - 1, prevS / WORLD.BASE);

    if (adelta <= tol) {
      /* Perfect — snap into alignment, grow combo, maybe regrow the block. */
      this.combo += 1;
      let size = prevS;
      let regrow = false;
      if (this.combo >= RULES.PERFECT_REGROW_MIN_STREAK && prevS < WORLD.BASE) {
        const grown = Math.min(WORLD.BASE, prevS + WORLD.BASE * RULES.PERFECT_REGROW_RATIO);
        regrow = grown > prevS;
        size = grown;
      }
      const block: Block = {
        x: axis === 'x' ? prev.x : prev.x,
        z: axis === 'z' ? prev.z : prev.z,
        sx: axis === 'x' ? size : prev.sx,
        sz: axis === 'z' ? size : prev.sz,
        y: a.y,
        index,
      };
      this.blocks.push(block);
      return { type: 'perfect', block, combo: this.combo, regrow };
    }

    /* Imperfect — slice the overhang off. */
    this.combo = 0;
    const newSize = prevS - adelta;
    const newC = prevC + delta / 2;
    const cutC = newC + Math.sign(delta) * (newSize + adelta) / 2;
    const block: Block = {
      x: axis === 'x' ? newC : prev.x,
      z: axis === 'z' ? newC : prev.z,
      sx: axis === 'x' ? newSize : prev.sx,
      sz: axis === 'z' ? newSize : prev.sz,
      y: a.y,
      index,
    };
    const cut: CutPiece = {
      x: axis === 'x' ? cutC : a.x,
      z: axis === 'z' ? cutC : a.z,
      sx: axis === 'x' ? adelta : a.sx,
      sz: axis === 'z' ? adelta : a.sz,
      y: a.y,
      axis,
      dir: (Math.sign(delta) || 1) as 1 | -1,
    };
    this.blocks.push(block);
    return { type: 'placed', block, cut, combo: 0 };
  }
}
