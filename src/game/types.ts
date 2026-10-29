/** Shared types across game logic, rendering and UI. */

export type Axis = 'x' | 'z';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export type Lang = 'en' | 'tr' | 'az';

export type Quality = 'auto' | 'high' | 'eco';

/** One placed block of the tower. */
export interface Block {
  x: number;
  z: number;
  /** Size along x. */
  sx: number;
  /** Size along z. */
  sz: number;
  y: number;
  /** Floor index (base block = 0). */
  index: number;
}

/** A piece sliced off an imperfect placement (or the whole block on a miss). */
export interface CutPiece {
  x: number;
  z: number;
  sx: number;
  sz: number;
  y: number;
  /** Sliding axis the piece was moving on (for debris nudge direction). */
  axis?: Axis;
  dir?: 1 | -1;
}

/** The moving block currently sliding above the tower. */
export interface ActiveBlock {
  axis: Axis;
  /** Ping-pong phase in [0,1). */
  u: number;
  x: number;
  z: number;
  sx: number;
  sz: number;
  y: number;
}

export type DropResult =
  | { type: 'perfect'; block: Block; combo: number; regrow: boolean }
  | { type: 'placed'; block: Block; cut: CutPiece; combo: 0 }
  | { type: 'miss'; fallen: CutPiece };

export interface RunStats {
  /** Floors stacked (equals score in meters). */
  height: number;
  perfects: number;
  bestCombo: number;
  gems: number;
  startedAt: number;
}

export interface SaveStats {
  runs: number;
  totalFloors: number;
  totalPerfects: number;
  bestCombo: number;
  playMs: number;
}

export interface SaveSettings {
  sound: boolean;
  haptics: boolean;
  quality: Quality;
  lang: Lang;
}

export interface SaveMissions {
  date: string;
  list: MissionDef[];
  progress: Record<string, number>;
  claimed: string[];
}

export interface SaveData {
  v: 1;
  best: number;
  gems: number;
  unlocked: string[];
  theme: string;
  stats: SaveStats;
  settings: SaveSettings;
  missions: SaveMissions;
  onboarded: boolean;
}

/* ------------------------------------------------------------------ */
/* Missions                                                            */
/* ------------------------------------------------------------------ */

export type MissionType = 'height' | 'perfects' | 'combo' | 'runs' | 'floors';

export interface MissionDef {
  id: string;
  type: MissionType;
  /** Target value (height meters, counts...). */
  target: number;
  /** Gem reward. */
  reward: number;
  /** i18n key for the title template. */
  titleKey: string;
}

export interface MissionView extends MissionDef {
  progress: number;
  done: boolean;
  claimed: boolean;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export type GameEvents = {
  'state:change': { from: GameState; to: GameState };
  'run:start': Record<string, never>;
  'run:end': { height: number; best: number; isRecord: boolean; gems: number };
  'block:place': { block: Block; perfect: boolean; combo: number; regrow: boolean };
  'block:cut': { piece: CutPiece };
  'block:miss': { piece: CutPiece };
  'gems:gain': { amount: number; total: number };
  'milestone': { height: number; bonus: number };
  'theme:select': { id: string };
  'theme:unlock': { id: string };
  'mission:progress': { type: MissionType };
  'mission:complete': { id: string; reward: number };
  'settings:change': { key: keyof SaveSettings };
  'lang:change': { lang: Lang };
}
