/**
 * Hud — in-run chrome: height counter, gem counter, pause button,
 * combo popups, milestone banner, perfect flash, vignette.
 * Everything pointer-events:none except the pause button (.ui-block).
 */
import { el, qs, retrigger } from './dom';
import { t } from './i18n';
import { ICONS } from './icons';
import type { Block } from '../game/types';

export class Hud {
  readonly root: HTMLElement;
  private heightEl: HTMLElement;
  private gemsEl: HTMLElement;
  private comboEl: HTMLElement;
  private comboMain: HTMLElement;
  private comboSub: HTMLElement;
  private milestoneEl: HTMLElement;
  private flashEl: HTMLElement;
  private pauseBtn: HTMLButtonElement;
  private lastHeight = -1;
  private lastGems = -1;
  private milestoneTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement, onPause: () => void) {
    this.root = el(`
      <div class="hud" aria-hidden="false">
        <div class="hud-top">
          <button class="hud-btn ui-block" type="button" aria-label=""></button>
          <div class="hud-height-wrap">
            <div class="hud-height" role="status" aria-live="off">0</div>
            <div class="hud-unit">m</div>
          </div>
          <div class="hud-gems">
            <span class="hud-gem-icon">${ICONS.gem}</span>
            <span class="hud-gem-count">0</span>
          </div>
        </div>
        <div class="combo-pop" aria-live="polite">
          <div class="combo-main"></div>
          <div class="combo-sub"></div>
        </div>
        <div class="milestone-banner" aria-live="polite"></div>
        <div class="flash"></div>
        <div class="vignette"></div>
      </div>
    `);
    parent.appendChild(this.root);

    this.pauseBtn = qs(this.root, '.hud-btn');
    this.pauseBtn.setAttribute('aria-label', t('a11y.pause'));
    this.pauseBtn.innerHTML = ICONS.pause;
    this.pauseBtn.addEventListener('click', () => {
      onPause();
    });

    this.heightEl = qs(this.root, '.hud-height');
    this.gemsEl = qs(this.root, '.hud-gem-count');
    this.comboEl = qs(this.root, '.combo-pop');
    this.comboMain = qs(this.comboEl, '.combo-main');
    this.comboSub = qs(this.comboEl, '.combo-sub');
    this.milestoneEl = qs(this.root, '.milestone-banner');
    this.flashEl = qs(this.root, '.flash');
  }

  setHeight(n: number): void {
    if (n === this.lastHeight) return;
    this.lastHeight = n;
    this.heightEl.textContent = String(n);
    this.heightEl.setAttribute('aria-label', t('a11y.height', { n }));
    retrigger(this.heightEl, 'pop');
  }

  setGems(n: number): void {
    if (n === this.lastGems) return;
    this.lastGems = n;
    this.gemsEl.textContent = String(n);
    retrigger(this.gemsEl, 'pop');
  }

  showCombo(combo: number, regrow: boolean): void {
    this.comboMain.textContent = combo > 1 ? `${t('combo.perfect')} ×${combo}` : t('combo.perfect');
    this.comboSub.textContent = regrow ? t('combo.growing') : '';
    retrigger(this.comboEl, 'show');
    retrigger(this.flashEl, 'on');
  }

  showMilestone(height: number, bonus: number): void {
    this.milestoneEl.textContent = t('milestone.text', { n: height, b: bonus });
    retrigger(this.milestoneEl, 'show');
    if (this.milestoneTimer) clearTimeout(this.milestoneTimer);
    this.milestoneTimer = setTimeout(() => this.milestoneEl.classList.remove('show'), 2600);
  }

  onPlace(b: Block): void {
    this.setHeight(b.index);
  }

  show(v: boolean): void {
    this.root.classList.toggle('hidden', !v);
  }

  dispose(): void {
    if (this.milestoneTimer) clearTimeout(this.milestoneTimer);
    this.root.remove();
  }
}
