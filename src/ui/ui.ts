/**
 * Ui — screen-stack controller + HUD + toast. Screens are built fresh on
 * every show() so they always reflect current save state.
 */
import { el } from './dom';
import { Hud } from './hud';
import { Toast } from './toast';
import { createMenuScreen } from './screens/menu';
import { createGameOverScreen } from './screens/gameover';
import { createThemesScreen } from './screens/themes';
import { createMissionsScreen } from './screens/missions';
import { createSettingsScreen } from './screens/settings';
import { createPauseScreen } from './screens/pause';
import { createOnboardScreen } from './screens/onboard';
import type { GameOverData, ScreenCtx } from './types';
import type { Quality } from '../game/types';

export type ScreenName = 'none' | 'menu' | 'gameover' | 'themes' | 'missions' | 'settings' | 'pause' | 'onboard';

export class Ui {
  readonly root: HTMLElement;
  readonly hud: Hud;
  readonly toast: Toast;
  /** Assigned by main.ts — applies graphics quality to the stage. */
  qualityHandler: ((q: Quality) => void) | null = null;

  ctx: ScreenCtx | null = null;
  private screen: HTMLElement | null = null;
  private name: ScreenName = 'none';

  constructor(app: HTMLElement, onPause: () => void) {
    this.root = el('<div class="ui-root"></div>');
    app.appendChild(this.root);
    this.hud = new Hud(this.root, onPause);
    this.toast = new Toast(this.root);
  }

  get current(): ScreenName {
    return this.name;
  }

  onQualityChange(q: Quality): void {
    this.qualityHandler?.(q);
  }

  show(name: ScreenName, data?: GameOverData): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const old = this.screen;
    if (old && old.parentElement) {
      old.classList.add('leaving');
      window.setTimeout(() => old.remove(), 240);
    }

    this.name = name;
    this.screen = null;

    let node: HTMLElement | null = null;
    switch (name) {
      case 'menu':
        node = createMenuScreen(ctx);
        break;
      case 'gameover':
        node = createGameOverScreen(ctx, data ?? { height: 0, best: ctx.save.best, isRecord: false, gems: 0 });
        break;
      case 'themes':
        node = createThemesScreen(ctx);
        break;
      case 'missions':
        node = createMissionsScreen(ctx);
        break;
      case 'settings':
        node = createSettingsScreen(ctx);
        break;
      case 'pause':
        node = createPauseScreen(ctx);
        break;
      case 'onboard':
        node = createOnboardScreen();
        break;
      default:
        node = null;
    }

    if (node) {
      this.root.appendChild(node);
      this.screen = node;
    }

    this.hud.show(name === 'none' || name === 'onboard' || name === 'pause');
  }
}
