/** Menu screen — the front door. Live 3D scene shows behind it. */
import { el, qs } from '../dom';
import { t } from '../i18n';
import { ICONS, LOGO_SVG } from '../icons';
import type { ScreenCtx } from '../types';

export function createMenuScreen(ctx: ScreenCtx): HTMLElement {
  const node = el(`
    <div class="screen menu-screen">
      <div class="menu-inner">
        <div class="menu-logo">
          ${LOGO_SVG}
          <h1 class="menu-title">STAKURA</h1>
        </div>
        <p class="menu-tagline">${t('menu.tagline')}</p>
        <div class="menu-best">${ICONS.trophy}<span>${t('menu.best', { n: ctx.save.best })}</span></div>
        <button class="btn btn-primary btn-play ui-block" type="button">${ICONS.play}<span>${t('menu.play')}</span></button>
        <div class="menu-row">
          <button class="menu-icon-btn ui-block" type="button" data-action="themes">
            ${ICONS.sparkle}<span>${t('menu.themes')}</span>
          </button>
          <button class="menu-icon-btn ui-block" type="button" data-action="missions">
            ${ICONS.target}<span>${t('menu.missions')}</span>
          </button>
          <button class="menu-icon-btn ui-block" type="button" data-action="settings">
            ${ICONS.gear}<span>${t('menu.settings')}</span>
          </button>
        </div>
      </div>
    </div>
  `);

  qs(node, '.btn-play').addEventListener('click', () => {
    ctx.audio.uiTick();
    ctx.game.startRun();
  });
  for (const btn of node.querySelectorAll<HTMLButtonElement>('.menu-icon-btn')) {
    btn.addEventListener('click', () => {
      ctx.audio.uiTick();
      ctx.haptics.ui();
      const action = btn.dataset.action;
      if (action === 'themes') ctx.ui.show('themes');
      else if (action === 'missions') ctx.ui.show('missions');
      else if (action === 'settings') ctx.ui.show('settings');
    });
  }
  return node;
}
