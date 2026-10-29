/** Shared context handed to every screen factory. */
import type { Game } from '../game/state';
import type { Missions } from '../game/missions';
import type { EventBus } from '../core/events';
import type { AudioEngine } from '../core/audio';
import type { Haptics } from '../platform/haptics';
import type { GameEvents, SaveData } from '../game/types';
import type { Ui } from './ui';

export interface ScreenCtx {
  game: Game;
  save: SaveData;
  bus: EventBus<GameEvents>;
  audio: AudioEngine;
  haptics: Haptics;
  missions: Missions;
  ui: Ui;
}

export interface GameOverData {
  height: number;
  best: number;
  isRecord: boolean;
  gems: number;
}
